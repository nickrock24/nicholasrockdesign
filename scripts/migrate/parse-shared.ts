import os from "node:os";
import path from "node:path";
import type { CheerioAPI } from "cheerio";

export const SOURCE_DIR = path.join(os.homedir(), "Downloads", "nicholasrock-design-bu");

export type ParsedImage = {
  url: string;
  filename: string;
  width: number | null;
  height: number | null;
};

/** Extracts the full-res gallery images from a Squarespace export page, in DOM order, deduped by URL. */
export function extractImages($: CheerioAPI): ParsedImage[] {
  const seen = new Set<string>();
  const images: ParsedImage[] = [];

  $("img[data-image]").each((_, el) => {
    const url = $(el).attr("data-image");
    if (!url || seen.has(url)) return;
    seen.add(url);

    const width = Number($(el).attr("width")) || null;
    const height = Number($(el).attr("height")) || null;
    const filename = url.split("/").pop() ?? "image.jpg";
    images.push({ url, filename, width, height });
  });

  return images;
}

/** Strips the "&mdash; Nicholas Rock" (or "— Nicholas Rock") suffix Squarespace appends to every <title>. */
export function stripSiteSuffix(rawTitle: string): string {
  return rawTitle.replace(/\s*[—-]\s*Nicholas Rock\s*$/i, "").trim();
}

export const MAILTO_MARKER = "nickrock@bu.edu";
