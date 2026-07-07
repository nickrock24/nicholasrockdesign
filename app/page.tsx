import Link from "next/link";
import { listProfessionalWork } from "@/lib/content/professional-work";
import { listNews } from "@/lib/content/news";
import { ProjectCard } from "@/components/ProjectCard";

export default async function HomePage() {
  const [projects, news] = await Promise.all([listProfessionalWork(), listNews()]);
  const featured = projects.filter((p) => p.featured).slice(0, 6);
  const latestNews = news.slice(0, 3);

  return (
    <div className="space-y-16">
      <section>
        <h1 className="text-3xl font-semibold">Nicholas Rock</h1>
        <p className="mt-2 max-w-2xl text-black/70">
          Designer and educator working across professional practice, teaching, and research.
        </p>
      </section>

      {featured.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-semibold">Featured Work</h2>
            <Link href="/professional-work" className="font-mono text-sm hover:opacity-60">
              View all
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((project) => (
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
        </section>
      )}

      {latestNews.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-semibold">Latest News</h2>
            <Link href="/news" className="font-mono text-sm hover:opacity-60">
              View all
            </Link>
          </div>
          <ul className="mt-6 space-y-4">
            {latestNews.map((item) => (
              <li key={item.id}>
                <p className="font-medium">{item.title}</p>
                {item.date ? <p className="font-mono text-sm text-black/60">{item.date}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
