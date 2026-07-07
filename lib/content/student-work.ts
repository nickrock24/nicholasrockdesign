import "server-only";
import { listRecords, escapeFormulaValue, type AirtableRecord } from "@/lib/airtable";
import { resolveImages } from "@/lib/images";
import { CONTENT_TABLES } from "@/lib/tables";
import { studentWorkSchema, type StudentWork, type AirtableAttachment } from "@/types/airtable";

const CONFIG = CONTENT_TABLES["student-work"];

type RawFields = {
  "Student Name"?: string;
  "Course/Class Name"?: string;
  "Academic Year"?: string;
  Title?: string;
  Slug?: string;
  Description?: string;
  Images?: AirtableAttachment[];
  "Image Sync Map"?: string;
  "YouTube Urls"?: string;
};

function mapRecord(record: AirtableRecord<RawFields>): StudentWork {
  const f = record.fields;
  return studentWorkSchema.parse({
    id: record.id,
    studentName: f["Student Name"] ?? null,
    courseName: f["Course/Class Name"] ?? null,
    academicYear: f["Academic Year"] ?? null,
    title: f.Title ?? "",
    slug: f.Slug ?? "",
    description: f.Description ?? null,
    images: resolveImages(f.Images, f["Image Sync Map"]),
    youtubeUrls: f["YouTube Urls"] ?? null,
  });
}

export async function listStudentWork(): Promise<StudentWork[]> {
  const records = await listRecords<RawFields>(CONFIG.table, {
    filterByFormula: "{Published} = TRUE()",
    sort: [{ field: "Academic Year", direction: "desc" }],
    tag: CONFIG.tag,
  });
  return records.map(mapRecord);
}

export async function getStudentWorkBySlug(slug: string): Promise<StudentWork | null> {
  const records = await listRecords<RawFields>(CONFIG.table, {
    filterByFormula: `AND({Published} = TRUE(), {Slug} = "${escapeFormulaValue(slug)}")`,
    tag: CONFIG.tag,
  });
  return records[0] ? mapRecord(records[0]) : null;
}
