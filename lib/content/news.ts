import "server-only";
import { listRecords, type AirtableRecord } from "@/lib/airtable";
import { resolveImages } from "@/lib/images";
import { CONTENT_TABLES } from "@/lib/tables";
import { newsItemSchema, type NewsItem, type AirtableAttachment } from "@/types/airtable";

const CONFIG = CONTENT_TABLES.news;

type RawFields = {
  Title?: string;
  Date?: string;
  Body?: string;
  "External Url"?: string;
  "External Link Label"?: string;
  Images?: AirtableAttachment[];
  "Image Sync Map"?: string;
  "YouTube Urls"?: string;
};

function mapRecord(record: AirtableRecord<RawFields>): NewsItem {
  const f = record.fields;
  const images = resolveImages(f.Images, f["Image Sync Map"]);
  return newsItemSchema.parse({
    id: record.id,
    title: f.Title ?? "",
    date: f.Date ?? null,
    body: f.Body ?? null,
    externalLinkUrl: f["External Url"] ?? null,
    externalLinkLabel: f["External Link Label"] ?? null,
    image: images[0] ?? null,
    youtubeUrls: f["YouTube Urls"] ?? null,
  });
}

export async function listNews(): Promise<NewsItem[]> {
  const records = await listRecords<RawFields>(CONFIG.table, {
    filterByFormula: "{Published} = TRUE()",
    sort: [{ field: "Date", direction: "desc" }],
    tag: CONFIG.tag,
  });
  return records.map(mapRecord);
}
