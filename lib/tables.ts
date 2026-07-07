export const CONTENT_TABLES = {
  "professional-work": {
    table: "Professional Work",
    tag: "professional-work",
    imageFields: ["Images"],
    syncField: "Image Sync Map",
  },
  "student-work": {
    table: "Student Work",
    tag: "student-work",
    imageFields: ["Images"],
    syncField: "Image Sync Map",
  },
  news: {
    table: "News",
    tag: "news",
    imageFields: ["Images"],
    syncField: "Image Sync Map",
  },
  research: {
    table: "Research",
    tag: "research",
    imageFields: ["Images"],
    syncField: "Image Sync Map",
  },
  pages: {
    table: "Pages",
    tag: "pages",
    imageFields: ["Images"],
    syncField: "Image Sync Map",
  },
} as const;

export type ContentTableKey = keyof typeof CONTENT_TABLES;

export function isContentTableKey(value: string): value is ContentTableKey {
  return value in CONTENT_TABLES;
}
