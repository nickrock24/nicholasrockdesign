import { z } from "zod";

export const airtableAttachmentSchema = z.object({
  id: z.string(),
  url: z.string(),
  filename: z.string(),
  size: z.number().optional(),
  type: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});
export type AirtableAttachment = z.infer<typeof airtableAttachmentSchema>;

export const contentImageSchema = z.object({
  id: z.string(),
  url: z.string(),
  alt: z.string(),
  width: z.number().nullable(),
  height: z.number().nullable(),
});
export type ContentImage = z.infer<typeof contentImageSchema>;

export const professionalWorkSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  categories: z.array(z.string()).default([]),
  year: z.string().nullable(),
  client: z.string().nullable(),
  summary: z.string().nullable(),
  description: z.string().nullable(),
  images: z.array(contentImageSchema).default([]),
  youtubeUrls: z.string().nullable(),
  featured: z.boolean().default(false),
  displayOrder: z.number().nullable(),
  externalLink: z.string().nullable(),
});
export type ProfessionalWork = z.infer<typeof professionalWorkSchema>;

export const studentWorkSchema = z.object({
  id: z.string(),
  studentName: z.string().nullable(),
  courseName: z.string().nullable(),
  academicYear: z.string().nullable(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  images: z.array(contentImageSchema).default([]),
  youtubeUrls: z.string().nullable(),
});
export type StudentWork = z.infer<typeof studentWorkSchema>;

export const newsItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z.string().nullable(),
  body: z.string().nullable(),
  externalLinkUrl: z.string().nullable(),
  externalLinkLabel: z.string().nullable(),
  image: contentImageSchema.nullable(),
  youtubeUrls: z.string().nullable(),
});
export type NewsItem = z.infer<typeof newsItemSchema>;

export const researchItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string().nullable(),
  description: z.string().nullable(),
  images: z.array(contentImageSchema).default([]),
  linksOrPapers: z.string().nullable(),
  year: z.number().nullable(),
  youtubeUrls: z.string().nullable(),
});
export type ResearchItem = z.infer<typeof researchItemSchema>;

export const pageSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  body: z.string().nullable(),
  images: z.array(contentImageSchema).default([]),
});
export type Page = z.infer<typeof pageSchema>;
