import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import { extractImages, MAILTO_MARKER, SOURCE_DIR, stripSiteSuffix, type ParsedImage } from "./parse-shared";

const PROJECTS_DIR = path.join(SOURCE_DIR, "professional-work");

export type ParsedProject = {
  slug: string;
  title: string;
  summary: string;
  images: ParsedImage[];
};

function extractSummary($: cheerio.CheerioAPI): string {
  let summary = "";
  $(".sqs-html-content").each((_, el) => {
    if (summary) return;
    const text = $(el).text().trim();
    if (!text || text.includes(MAILTO_MARKER)) return;
    const h3 = $(el).find("h3").first().text().trim();
    summary = h3 || text;
  });
  return summary;
}

function parseFile(filePath: string): ParsedProject {
  const html = fs.readFileSync(filePath, "utf-8");
  const $ = cheerio.load(html);
  const slug = path.basename(filePath, ".html");
  const title = stripSiteSuffix($("title").text()) || slug;

  return {
    slug,
    title,
    summary: extractSummary($),
    images: extractImages($),
  };
}

/** Parses every project page, skipping the Squarespace lightbox-modal duplicates (filenames containing "itemId="). */
export function parseAllProfessionalWork(): ParsedProject[] {
  const files = fs
    .readdirSync(PROJECTS_DIR)
    .filter((f) => f.endsWith(".html") && !f.includes("itemId="));

  return files.map((f) => parseFile(path.join(PROJECTS_DIR, f)));
}
