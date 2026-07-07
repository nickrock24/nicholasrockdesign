import "server-only";
import { listRecords, type AirtableRecord } from "@/lib/airtable";
import { resolveImages } from "@/lib/images";
import { CONTENT_TABLES } from "@/lib/tables";
import { researchItemSchema, type ResearchItem, type AirtableAttachment } from "@/types/airtable";

const CONFIG = CONTENT_TABLES.research;

type RawFields = {
  Title?: string;
  Status?: string;
  Description?: string;
  Images?: AirtableAttachment[];
  "Image Sync Map"?: string;
  "Links/Papers"?: string;
  Year?: number;
  "YouTube Urls"?: string;
};

function mapRecord(record: AirtableRecord<RawFields>): ResearchItem {
  const f = record.fields;
  return researchItemSchema.parse({
    id: record.id,
    title: f.Title ?? "",
    status: f.Status ?? null,
    description: f.Description ?? null,
    images: resolveImages(f.Images, f["Image Sync Map"]),
    linksOrPapers: f["Links/Papers"] ?? null,
    year: f.Year ?? null,
    youtubeUrls: f["YouTube Urls"] ?? null,
  });
}

export async function listResearch(): Promise<ResearchItem[]> {
  const records = await listRecords<RawFields>(CONFIG.table, {
    filterByFormula: "{Published} = TRUE()",
    sort: [{ field: "Year", direction: "desc" }],
    tag: CONFIG.tag,
  });
  return records.map(mapRecord);
}
