import { createRecords, updateRecordFields, type AirtableRecord } from "@/lib/airtable";
import { uploadAttachmentToBlob } from "@/lib/images";
import type { ParsedImage } from "./parse-shared";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(label: string, fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const delay = 2 ** i * 1000;
      console.warn(`[migrate] ${label} failed (attempt ${i + 1}/${attempts}), retrying in ${delay}ms`);
      await sleep(delay);
    }
  }
  throw lastErr;
}

// Airtable: max 10 records per create call, ~5 requests/sec per base.
const BATCH_SIZE = 10;
const REQUEST_INTERVAL_MS = 250;

/** Phase 1: create bare text-field records, batched and rate-limited. Fast, low failure risk. */
export async function createBareRecords(
  table: string,
  items: { fields: Record<string, unknown> }[]
): Promise<AirtableRecord[]> {
  const created: AirtableRecord[] = [];
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE).map((item) => ({ fields: item.fields }));
    const records = await withRetry(`create batch @${i}`, () => createRecords(table, batch));
    created.push(...records);
    await sleep(REQUEST_INTERVAL_MS);
  }
  return created;
}

export type ImageAttachResult = {
  recordId: string;
  attachedCount: number;
  failed: boolean;
};

/**
 * Phase 2: attaches a record's images and mirrors them to Vercel Blob.
 * Airtable fetches each `images[].url` server-side to create its own
 * attachment (giving us an attachment id per image, in submission order).
 * We then mirror the *original* source URLs (still stable — this is the
 * Squarespace CDN, not Airtable's short-lived attachment URL) straight to
 * Blob, keyed by those attachment ids, and write the sync map back.
 */
export async function attachImagesToRecord(
  table: string,
  blobPrefix: string,
  recordId: string,
  imageField: string,
  syncField: string,
  images: ParsedImage[]
): Promise<ImageAttachResult> {
  if (!images.length) return { recordId, attachedCount: 0, failed: false };

  try {
    const updated = await withRetry(`attach images for ${recordId}`, () =>
      updateRecordFields(table, recordId, {
        [imageField]: images.map((img) => ({ url: img.url })),
      })
    );

    const attachments = (updated.fields[imageField] as { id: string; filename: string }[] | undefined) ?? [];

    const syncMap: Record<string, string> = {};
    for (let i = 0; i < attachments.length; i++) {
      const source = images[i];
      if (!source) continue;
      // Use the filename we already parsed from the source HTML, not
      // attachments[i].filename — Airtable's PATCH response returns the
      // attachment before it's finished resolving metadata, so filename
      // comes back empty here even though a later GET would show it.
      const blobUrl = await uploadAttachmentToBlob(
        blobPrefix,
        recordId,
        attachments[i].id,
        source.filename,
        source.url
      );
      if (blobUrl) syncMap[attachments[i].id] = blobUrl;
    }

    await withRetry(`write sync map for ${recordId}`, () =>
      updateRecordFields(table, recordId, { [syncField]: JSON.stringify(syncMap) })
    );

    return { recordId, attachedCount: Object.keys(syncMap).length, failed: false };
  } catch (err) {
    console.error(`[migrate] failed to attach images for record ${recordId}`, err);
    return { recordId, attachedCount: 0, failed: true };
  }
}
