import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProfessionalWorkBySlug, listProfessionalWork } from "@/lib/content/professional-work";
import { ImageGallery } from "@/components/ImageGallery";
import { YouTubeEmbedList } from "@/components/YouTubeEmbed";
import { RichText } from "@/components/RichText";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await listProfessionalWork();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProfessionalWorkBySlug(slug);
  return { title: project?.title ?? "Professional Work" };
}

export default async function ProfessionalWorkDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProfessionalWorkBySlug(slug);
  if (!project) notFound();

  const meta = [project.client, project.year].filter(Boolean).join(" — ");

  return (
    <article className="space-y-10">
      <header>
        <h1 className="text-3xl font-semibold">{project.title}</h1>
        {meta ? <p className="mt-2 font-mono text-black/60">{meta}</p> : null}
        {project.categories.length > 0 ? (
          <p className="mt-1 font-mono text-sm text-black/50">{project.categories.join(" · ")}</p>
        ) : null}
        {project.externalLink ? (
          <a
            href={project.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block font-mono text-sm underline underline-offset-4 hover:opacity-60"
          >
            Visit project
          </a>
        ) : null}
      </header>

      <RichText body={project.description} />
      <YouTubeEmbedList raw={project.youtubeUrls} title={project.title} />
      <ImageGallery images={project.images} />
    </article>
  );
}
