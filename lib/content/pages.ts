import "server-only";
import { listRecords, escapeFormulaValue, type AirtableRecord } from "@/lib/airtable";
import { resolveImages } from "@/lib/images";
import { CONTENT_TABLES } from "@/lib/tables";
import { pageSchema, type Page, type AirtableAttachment } from "@/types/airtable";

const CONFIG = CONTENT_TABLES.pages;

type RawFields = {
  Slug?: string;
  Title?: string;
  Body?: string;
  Images?: AirtableAttachment[];
  "Image Sync Map"?: string;
};

function mapRecord(record: AirtableRecord<RawFields>): Page {
  const f = record.fields;
  return pageSchema.parse({
    id: record.id,
    slug: f.Slug ?? "",
    title: f.Title ?? "",
    body: f.Body ?? null,
    images: resolveImages(f.Images, f["Image Sync Map"]),
  });
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const records = await listRecords<RawFields>(CONFIG.table, {
    filterByFormula: `AND({Published} = TRUE(), {Slug} = "${escapeFormulaValue(slug)}")`,
    tag: CONFIG.tag,
  });
  return records[0] ? mapRecord(records[0]) : null;
}
