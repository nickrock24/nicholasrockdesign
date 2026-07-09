import Link from "next/link";

const LINKS = [
  { href: "/professional-work", label: "Professional Work" },
  { href: "/student-work", label: "Student Work" },
  { href: "/news", label: "News" },
  { href: "/research", label: "Research" },
  { href: "/teaching", label: "Teaching" },
  { href: "/about", label: "About" },
];

export function Nav() {
  return (
    <header className="border-b border-black/10">
      <div className="mx-auto flex w-full max-w-[1800px] flex-wrap items-center justify-between gap-4 px-6 py-5 font-mono sm:px-10 lg:px-16">
        <Link href="/" className="text-sm font-semibold tracking-wide uppercase">
          Nicholas Rock
        </Link>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:opacity-60">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
