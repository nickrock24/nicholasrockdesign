import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import { SOURCE_DIR } from "./parse-shared";

export type ParsedNewsItem = {
  title: string;
  linkUrl: string | null;
  youtubeUrl: string | null;
};

const YOUTUBE_PATTERN = /youtube\.com|youtu\.be/i;

/** News entries are mechanical: an h3 title + a single link/paragraph. The header block and the site-wide mailto footer both lack an h3, so they're naturally excluded. */
export function parseNews(): ParsedNewsItem[] {
  const html = fs.readFileSync(path.join(SOURCE_DIR, "news.html"), "utf-8");
  const $ = cheerio.load(html);
  const items: ParsedNewsItem[] = [];

  $(".sqs-html-content").each((_, el) => {
    const h3 = $(el).find("h3").first();
    if (!h3.length) return;

    const title = h3.text().trim();
    const p = $(el).find("p").first();
    const linkEl = p.find("a").first();
    const rawLink = linkEl.attr("href") || p.text().trim() || null;

    if (!rawLink) {
      items.push({ title, linkUrl: null, youtubeUrl: null });
      return;
    }

    const isYouTube = YOUTUBE_PATTERN.test(rawLink);
    items.push({
      title,
      linkUrl: isYouTube ? null : rawLink,
      youtubeUrl: isYouTube ? rawLink : null,
    });
  });

  return items;
}
