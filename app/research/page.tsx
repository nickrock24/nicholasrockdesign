import type { Metadata } from "next";
import { listResearch } from "@/lib/content/research";
import { ImageGallery } from "@/components/ImageGallery";
import { YouTubeEmbedList } from "@/components/YouTubeEmbed";
import { RichText } from "@/components/RichText";

export const metadata: Metadata = { title: "Research" };

export default async function ResearchPage() {
  const items = await listResearch();

  return (
    <div>
      <h1 className="text-3xl font-semibold">Research</h1>
      <div className="mt-10 space-y-14">
        {items.map((item) => (
          <article key={item.id} className="border-b border-black/10 pb-14 last:border-0">
            <div className="flex items-baseline gap-3">
              <h2 className="text-xl font-medium">{item.title}</h2>
              {item.status ? (
                <span className="rounded-full bg-black/5 px-2.5 py-0.5 font-mono text-xs text-black/60">
                  {item.status}
                </span>
              ) : null}
            </div>
            {item.year ? <p className="mt-1 font-mono text-sm text-black/50">{item.year}</p> : null}
            <RichText body={item.description} className="mt-4" />
            {item.linksOrPapers ? (
              <div className="mt-4 space-y-1 font-mono text-sm">
                {item.linksOrPapers
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block underline underline-offset-4 hover:opacity-60"
                    >
                      {url}
                    </a>
                  ))}
              </div>
            ) : null}
            <YouTubeEmbedList raw={item.youtubeUrls} title={item.title} />
            <ImageGallery images={item.images} />
          </article>
        ))}
      </div>
    </div>
  );
}
