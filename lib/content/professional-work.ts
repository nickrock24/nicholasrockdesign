import "server-only";
import { listRecords, escapeFormulaValue, type AirtableRecord } from "@/lib/airtable";
import { resolveImages } from "@/lib/images";
import { CONTENT_TABLES } from "@/lib/tables";
import { professionalWorkSchema, type ProfessionalWork, type AirtableAttachment } from "@/types/airtable";

const CONFIG = CONTENT_TABLES["professional-work"];

type RawFields = {
  Title?: string;
  Slug?: string;
  "Category/Tags"?: string[];
  Year?: string | number;
  Client?: string;
  Summary?: string;
  Description?: string;
  Images?: AirtableAttachment[];
  "Image Sync Map"?: string;
  "YouTube Urls"?: string;
  Featured?: boolean;
  "Display Order"?: number;
  "External Link"?: string;
};

function mapRecord(record: AirtableRecord<RawFields>): ProfessionalWork {
  const f = record.fields;
  return professionalWorkSchema.parse({
    id: record.id,
    title: f.Title ?? "",
    slug: f.Slug ?? "",
    categories: f["Category/Tags"] ?? [],
    year: f.Year != null ? String(f.Year) : null,
    client: f.Client ?? null,
    summary: f.Summary ?? null,
    description: f.Description ?? null,
    images: resolveImages(f.Images, f["Image Sync Map"]),
    youtubeUrls: f["YouTube Urls"] ?? null,
    featured: Boolean(f.Featured),
    displayOrder: f["Display Order"] ?? null,
    externalLink: f["External Link"] ?? null,
  });
}

export async function listProfessionalWork(): Promise<ProfessionalWork[]> {
  const records = await listRecords<RawFields>(CONFIG.table, {
    filterByFormula: "{Published} = TRUE()",
    sort: [{ field: "Display Order", direction: "asc" }],
    tag: CONFIG.tag,
  });
  return records.map(mapRecord);
}

export async function getProfessionalWorkBySlug(slug: string): Promise<ProfessionalWork | null> {
  const records = await listRecords<RawFields>(CONFIG.table, {
    filterByFormula: `AND({Published} = TRUE(), {Slug} = "${escapeFormulaValue(slug)}")`,
    tag: CONFIG.tag,
  });
  return records[0] ? mapRecord(records[0]) : null;
}
