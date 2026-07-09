import Image from "next/image";
import Link from "next/link";
import type { ContentImage } from "@/types/airtable";

export function ProjectCard({
  href,
  title,
  subtitle,
  summary,
  image,
  className,
}: {
  href: string;
  title: string;
  subtitle?: string | null;
  summary?: string | null;
  image?: ContentImage | null;
  className?: string;
}) {
  return (
    <Link href={href} className={`group block ${className ?? ""}`}>
      <div className="relative aspect-4/3 overflow-hidden bg-black/5">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="mt-3">
        <h3 className="text-base font-medium">{title}</h3>
        {subtitle ? <p className="font-mono text-sm text-black/60">{subtitle}</p> : null}
        {summary ? <p className="mt-1 line-clamp-2 text-sm text-black/70">{summary}</p> : null}
      </div>
    </Link>
  );
}
