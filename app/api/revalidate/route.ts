import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { syncRecordImages } from "@/lib/images";
import { CONTENT_TABLES, isContentTableKey } from "@/lib/tables";

function isValidSecret(candidate: string | null): boolean {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected || !candidate) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

type RevalidateBody = {
  table?: string;
  recordId?: string;
  slug?: string;
};

/**
 * Webhook target for one Airtable Automation per table ("When record
 * updated" -> "Send webhook"). Invalidates the ISR cache for that content
 * type immediately and mirrors any new images to Vercel Blob.
 */
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidate-secret");
  if (!isValidSecret(secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as RevalidateBody | null;
  const table = body?.table;

  if (!table || !isContentTableKey(table)) {
    return NextResponse.json({ error: "Unknown or missing table" }, { status: 400 });
  }

  const config = CONTENT_TABLES[table];
  revalidateTag(config.tag, { expire: 0 });
  if (body?.slug) {
    revalidatePath(`/${table}/${body.slug}`);
  }

  if (body?.recordId) {
    try {
      await syncRecordImages(table, body.recordId);
    } catch (err) {
      console.error(`[revalidate] image sync failed for ${table}/${body.recordId}`, err);
    }
  }

  return NextResponse.json({ revalidated: true, table, now: Date.now() });
}
