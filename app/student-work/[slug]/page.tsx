import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStudentWorkBySlug, listStudentWork } from "@/lib/content/student-work";
import { ImageGallery } from "@/components/ImageGallery";
import { YouTubeEmbedList } from "@/components/YouTubeEmbed";
import { RichText } from "@/components/RichText";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await listStudentWork();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getStudentWorkBySlug(slug);
  return { title: project?.title ?? "Student Work" };
}

export default async function StudentWorkDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getStudentWorkBySlug(slug);
  if (!project) notFound();

  const meta = [project.studentName, project.courseName, project.academicYear]
    .filter(Boolean)
    .join(" — ");

  return (
    <article className="space-y-10">
      <header>
        <h1 className="text-3xl font-semibold">{project.title}</h1>
        {meta ? <p className="mt-2 font-mono text-black/60">{meta}</p> : null}
      </header>

      <RichText body={project.description} />
      <YouTubeEmbedList raw={project.youtubeUrls} title={project.title} />
      <ImageGallery images={project.images} />
    </article>
  );
}
