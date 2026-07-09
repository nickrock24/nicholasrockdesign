import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProfessionalWorkBySlug, listProfessionalWork } from "@/lib/content/professional-work";
import { ImageGallery } from "@/components/ImageGallery";
import { YouTubeEmbedList } from "@/components/YouTubeEmbed";
import { RichText } from "@/components/RichText";
import { PageHeader } from "@/components/PageHeader";

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
      <PageHeader title={project.title}>
        <RichText body={project.description} />
      </PageHeader>

      {meta || project.categories.length > 0 || project.externalLink ? (
        <div className="font-mono text-sm text-black/60">
          {meta ? <p>{meta}</p> : null}
          {project.categories.length > 0 ? (
            <p className="mt-1 text-black/50">{project.categories.join(" · ")}</p>
          ) : null}
          {project.externalLink ? (
            <a
              href={project.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block underline underline-offset-4 hover:opacity-60"
            >
              Visit project
            </a>
          ) : null}
        </div>
      ) : null}

      <YouTubeEmbedList raw={project.youtubeUrls} title={project.title} />
      <ImageGallery images={project.images} />
    </article>
  );
}
