import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import { MAILTO_MARKER, SOURCE_DIR } from "./parse-shared";

export type ParsedResearchBlock = { text: string };

/**
 * research.html's content doesn't follow a clean repeating pattern (mixed
 * "In-Progress" status tags, a nested "Previously" list of past talks/
 * publications, inline links) — unlike Professional Work and News, it's not
 * safe to auto-map onto Research table rows without misrepresenting the
 * content. This just extracts the raw text blocks in order for a human to
 * read and split into Research rows by hand in the Airtable UI (there are
 * only a handful of blocks, so this is a few minutes of work, not a script).
 */
export function parseResearchBlocks(): ParsedResearchBlock[] {
  const html = fs.readFileSync(path.join(SOURCE_DIR, "research.html"), "utf-8");
  const $ = cheerio.load(html);
  const blocks: ParsedResearchBlock[] = [];

  $(".sqs-html-content").each((_, el) => {
    const text = $(el).text().trim();
    if (!text || text.includes(MAILTO_MARKER)) return;
    blocks.push({ text });
  });

  return blocks;
}

export function writeResearchReviewFile(outputPath: string): void {
  const blocks = parseResearchBlocks();
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(blocks, null, 2));
}
