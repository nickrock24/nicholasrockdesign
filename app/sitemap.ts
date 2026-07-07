import type { MetadataRoute } from "next";
import { listProfessionalWork } from "@/lib/content/professional-work";
import { listStudentWork } from "@/lib/content/student-work";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const STATIC_ROUTES = [
  "",
  "/professional-work",
  "/student-work",
  "/news",
  "/research",
  "/about",
  "/teaching",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, studentProjects] = await Promise.all([listProfessionalWork(), listStudentWork()]);

  const staticEntries = STATIC_ROUTES.map((path) => ({ url: `${SITE_URL}${path}` }));
  const professionalWorkEntries = projects.map((p) => ({
    url: `${SITE_URL}/professional-work/${p.slug}`,
  }));
  const studentWorkEntries = studentProjects.map((p) => ({
    url: `${SITE_URL}/student-work/${p.slug}`,
  }));

  return [...staticEntries, ...professionalWorkEntries, ...studentWorkEntries];
}
