import type { Metadata } from "next";
import { listProfessionalWork } from "@/lib/content/professional-work";
import { ProjectCard } from "@/components/ProjectCard";

export const metadata: Metadata = { title: "Professional Work" };

export default async function ProfessionalWorkPage() {
  const projects = await listProfessionalWork();

  return (
    <div>
      <h1 className="text-3xl font-semibold">Professional Work</h1>
      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            href={`/professional-work/${project.slug}`}
            title={project.title}
            subtitle={[project.client, project.year].filter(Boolean).join(" — ")}
            summary={project.summary}
            image={project.images[0]}
          />
        ))}
      </div>
    </div>
  );
}
