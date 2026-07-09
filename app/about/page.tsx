import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/content/pages";
import { ImageGallery } from "@/components/ImageGallery";
import { RichText } from "@/components/RichText";

export const metadata: Metadata = { title: "About" };

export default async function AboutPage() {
  const page = await getPageBySlug("about");
  if (!page) notFound();

  const [photo, ...moreImages] = page.images;

  return (
    <article>
      <div className="grid grid-cols-1 gap-y-8 sm:grid-cols-3 sm:items-start sm:gap-x-8">
        <h1 className="text-4xl leading-none font-semibold sm:col-start-1 sm:col-span-2 sm:row-start-1 sm:text-5xl">
          {page.title}
        </h1>

        {photo ? (
          <div className="relative aspect-square overflow-hidden sm:col-start-3 sm:row-start-1">
            <Image src={photo.url} alt={photo.alt} fill className="object-cover" />
          </div>
        ) : null}

        <div className="sm:col-start-1 sm:col-span-2 sm:row-start-2">
          <RichText body={page.body} />
        </div>
      </div>

      {moreImages.length > 0 ? <ImageGallery images={moreImages} /> : null}
    </article>
  );
}
