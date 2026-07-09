import type { Metadata } from "next";
import { listStudentWork } from "@/lib/content/student-work";
import { ProjectCard } from "@/components/ProjectCard";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = { title: "Student Work" };

export default async function StudentWorkPage() {
  const projects = await listStudentWork();

  return (
    <div>
      <PageHeader title="Student Work" />
      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            href={`/student-work/${project.slug}`}
            title={project.title}
            subtitle={[project.studentName, project.courseName, project.academicYear]
              .filter(Boolean)
              .join(" — ")}
            summary={project.description}
            image={project.images[0]}
          />
        ))}
      </div>
    </div>
  );
}
