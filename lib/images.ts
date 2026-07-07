import { put } from "@vercel/blob";
import { getRecordById, updateRecordFields } from "@/lib/airtable";
import { CONTENT_TABLES, type ContentTableKey } from "@/lib/tables";
import type { AirtableAttachment, ContentImage } from "@/types/airtable";

// Airtable attachment URLs are short-lived signed URLs (they expire in
// roughly 2 hours) and Airtable's own docs say not to rely on them as a
// CDN. `Image Sync Map` (a long-text JSON field, keyed by attachment id)
// records where each attachment has been permanently mirrored to Vercel
// Blob, so the site never renders a URL that can go stale mid-cache.
export const PLACEHOLDER_IMAGE = "/placeholders/image-pending.svg";

export function parseSyncMap(json: string | undefined | null): Record<string, string> {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function resolveImages(
  attachments: AirtableAttachment[] | undefined,
  syncMapJson: string | undefined
): ContentImage[] {
  if (!attachments?.length) return [];
  const syncMap = parseSyncMap(syncMapJson);
  return attachments.map((att) => {
    const url = syncMap[att.id];
    if (!url) {
      console.warn(`[images] no synced Blob URL yet for attachment ${att.id} (${att.filename})`);
    }
    return {
      id: att.id,
      url: url ?? PLACEHOLDER_IMAGE,
      alt: att.filename,
      width: att.width ?? null,
      height: att.height ?? null,
    };
  });
}

/**
 * Fetches a single image from `sourceUrl` and mirrors it to Vercel Blob
 * under a path keyed by table/record/attachment id. Shared by the webhook
 * sync (source = Airtable's short-lived attachment URL) and the migration
 * script (source = the original, stable Squarespace CDN URL).
 */
export async function uploadAttachmentToBlob(
  blobPrefix: string,
  recordId: string,
  attachmentId: string,
  filename: string,
  sourceUrl: string
): Promise<string | null> {
  try {
    const res = await fetch(sourceUrl);
    if (!res.ok) {
      console.warn(`[images] failed to fetch ${attachmentId} (${filename}) from ${sourceUrl}: ${res.status}`);
      return null;
    }
    const blob = await res.blob();
    const { url } = await put(`${blobPrefix}/${recordId}/${attachmentId}-${filename}`, blob, {
      access: "public",
      addRandomSuffix: false,
    });
    return url;
  } catch (err) {
    console.warn(`[images] error mirroring ${attachmentId} (${filename}) from ${sourceUrl}`, err);
    return null;
  }
}

async function syncAttachmentsToBlob(
  blobPrefix: string,
  recordId: string,
  attachments: AirtableAttachment[],
  existingSyncMap: Record<string, string>
): Promise<Record<string, string>> {
  const updated = { ...existingSyncMap };

  for (const att of attachments) {
    if (updated[att.id]) continue; // already mirrored
    const blobUrl = await uploadAttachmentToBlob(blobPrefix, recordId, att.id, att.filename, att.url);
    if (blobUrl) updated[att.id] = blobUrl;
  }

  return updated;
}

/**
 * Mirrors every not-yet-synced attachment on a single record to Vercel Blob
 * and writes the resulting permanent URLs back to Airtable's sync-map field.
 * Called from the /api/revalidate webhook (one record at a time, right
 * after an Airtable edit) and from the migration script (in bulk).
 */
export async function syncRecordImages(tableKey: ContentTableKey, recordId: string): Promise<void> {
  const config = CONTENT_TABLES[tableKey];
  const record = await getRecordById<Record<string, unknown>>(config.table, recordId);
  if (!record) return;

  const attachments = config.imageFields.flatMap(
    (field) => (record.fields[field] as AirtableAttachment[] | undefined) ?? []
  );
  if (!attachments.length) return;

  const existingMap = parseSyncMap(record.fields[config.syncField] as string | undefined);
  const updatedMap = await syncAttachmentsToBlob(tableKey, recordId, attachments, existingMap);

  const changed = Object.keys(updatedMap).length !== Object.keys(existingMap).length;
  if (changed) {
    await updateRecordFields(config.table, recordId, {
      [config.syncField]: JSON.stringify(updatedMap),
    });
  }
}
