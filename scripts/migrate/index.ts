import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

// Next.js treats .env.local as the highest-priority local override, but
// plain `dotenv/config` only auto-loads a file literally named `.env`.
dotenv.config({ path: path.join(__dirname, "..", "..", ".env.local") });
import { CONTENT_TABLES } from "@/lib/tables";
import { parseAllProfessionalWork } from "./parse-professional-work";
import { parseNews } from "./parse-news";
import { parseAllPages } from "./parse-pages";
import { writeResearchReviewFile } from "./parse-research";
import { attachImagesToRecord, createBareRecords, type ImageAttachResult } from "./airtable-writer";

const WRITE = process.argv.includes("--write");
const OUTPUT_DIR = path.join(__dirname, "output");

async function main() {
  const projects = parseAllProfessionalWork();
  const news = parseNews();
  const pages = parseAllPages();

  console.log("=== Migration dry-run summary ===");
  console.log(`Professional Work: ${projects.length} projects, ${projects.reduce((n, p) => n + p.images.length, 0)} images total`);
  console.log(`News: ${news.length} entries (${news.filter((n) => n.youtubeUrl).length} with a YouTube link)`);
  console.log(`Pages: ${pages.map((p) => p.slug).join(", ")}`);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  writeResearchReviewFile(path.join(OUTPUT_DIR, "research-review.json"));
  console.log(`Research: extracted to ${path.join(OUTPUT_DIR, "research-review.json")} for manual entry (content is too irregular to auto-map safely)`);

  if (!WRITE) {
    console.log("\nDry run only — pass --write to actually create Airtable records.");
    return;
  }

  const failures: ImageAttachResult[] = [];

  // --- Professional Work ---
  const pwConfig = CONTENT_TABLES["professional-work"];
  const pwRecords = await createBareRecords(
    pwConfig.table,
    projects.map((p) => ({
      fields: {
        Title: p.title,
        Slug: p.slug,
        Summary: p.summary,
        Description: p.summary,
        Published: false,
      },
    }))
  );
  console.log(`Created ${pwRecords.length} Professional Work records`);

  for (let i = 0; i < pwRecords.length; i++) {
    const result = await attachImagesToRecord(
      pwConfig.table,
      "professional-work",
      pwRecords[i].id,
      "Images",
      pwConfig.syncField,
      projects[i].images
    );
    if (result.failed) failures.push(result);
    console.log(`  [${i + 1}/${pwRecords.length}] ${projects[i].slug}: ${result.attachedCount}/${projects[i].images.length} images synced`);
  }

  // --- News ---
  const newsConfig = CONTENT_TABLES.news;
  const newsRecords = await createBareRecords(
    newsConfig.table,
    news.map((n) => ({
      fields: {
        Title: n.title,
        "External Url": n.linkUrl ?? undefined,
        "YouTube Urls": n.youtubeUrl ?? undefined,
        Published: false,
      },
    }))
  );
  console.log(`Created ${newsRecords.length} News records`);

  // --- Pages (About / Teaching) ---
  const pagesConfig = CONTENT_TABLES.pages;
  const pageRecords = await createBareRecords(
    pagesConfig.table,
    pages.map((p) => ({
      fields: {
        Slug: p.slug,
        Title: p.title,
        Body: p.body,
        Published: false,
      },
    }))
  );
  console.log(`Created ${pageRecords.length} Pages records`);

  for (let i = 0; i < pageRecords.length; i++) {
    const result = await attachImagesToRecord(
      pagesConfig.table,
      "pages",
      pageRecords[i].id,
      "Images",
      pagesConfig.syncField,
      pages[i].images
    );
    if (result.failed) failures.push(result);
  }

  if (failures.length) {
    const failuresPath = path.join(OUTPUT_DIR, "migration-failures.json");
    fs.writeFileSync(failuresPath, JSON.stringify(failures, null, 2));
    console.warn(`\n${failures.length} record(s) had image attachment failures — see ${failuresPath}`);
  }

  console.log("\nDone. Every migrated record was created with Published unchecked — review in Airtable and publish when ready.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
