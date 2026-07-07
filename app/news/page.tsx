import type { Metadata } from "next";
import Image from "next/image";
import { listNews } from "@/lib/content/news";
import { YouTubeEmbedList } from "@/components/YouTubeEmbed";
import { RichText } from "@/components/RichText";

export const metadata: Metadata = { title: "News" };

export default async function NewsPage() {
  const items = await listNews();

  return (
    <div>
      <h1 className="text-3xl font-semibold">News</h1>
      <div className="mt-10 space-y-12">
        {items.map((item) => (
          <article key={item.id} className="border-b border-black/10 pb-12 last:border-0">
            {item.date ? <p className="text-sm text-black/50">{item.date}</p> : null}
            <h2 className="mt-1 text-xl font-medium">{item.title}</h2>
            {item.image ? (
              <div className="relative mt-4 aspect-16/9 max-w-xl overflow-hidden bg-black/5">
                <Image src={item.image.url} alt={item.image.alt} fill className="object-cover" />
              </div>
            ) : null}
            <RichText body={item.body} className="mt-4" />
            <YouTubeEmbedList raw={item.youtubeUrls} title={item.title} />
            {item.externalLinkUrl ? (
              <a
                href={item.externalLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-sm underline underline-offset-4 hover:opacity-60"
              >
                {item.externalLinkLabel ?? "Read more"}
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
