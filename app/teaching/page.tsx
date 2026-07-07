import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/content/pages";
import { ImageGallery } from "@/components/ImageGallery";
import { RichText } from "@/components/RichText";

export const metadata: Metadata = { title: "Teaching" };

export default async function TeachingPage() {
  const page = await getPageBySlug("teaching");
  if (!page) notFound();

  return (
    <article className="space-y-10">
      <h1 className="text-3xl font-semibold">{page.title}</h1>
      <RichText body={page.body} />
      <ImageGallery images={page.images} />
    </article>
  );
}
