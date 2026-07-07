import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import { extractImages, MAILTO_MARKER, SOURCE_DIR, type ParsedImage } from "./parse-shared";

export type ParsedPage = {
  slug: "about" | "teaching";
  title: string;
  body: string;
  images: ParsedImage[];
};

function extractBody($: cheerio.CheerioAPI): string {
  const paragraphs: string[] = [];
  $(".sqs-html-content").each((_, el) => {
    const text = $(el).text().trim();
    if (!text || text.includes(MAILTO_MARKER)) return;
    paragraphs.push(text);
  });
  return paragraphs.join("\n\n");
}

function parsePage(slug: "about" | "teaching", title: string): ParsedPage {
  const html = fs.readFileSync(path.join(SOURCE_DIR, `${slug}.html`), "utf-8");
  const $ = cheerio.load(html);
  return {
    slug,
    title,
    body: extractBody($),
    images: extractImages($),
  };
}

export function parseAllPages(): ParsedPage[] {
  return [parsePage("about", "About"), parsePage("teaching", "Teaching")];
}
