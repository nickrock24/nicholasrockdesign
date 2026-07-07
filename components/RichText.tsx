import { marked } from "marked";

// Airtable's long-text fields store markdown when "rich text formatting" is
// enabled. Content is authored solely by the site owner in Airtable (not
// public user input), so rendering the parsed HTML directly is an
// acceptable trust boundary here.
export function RichText({ body, className }: { body: string | null; className?: string }) {
  if (!body) return null;
  const html = marked.parse(body, { async: false });

  return (
    <div
      className={`prose prose-neutral max-w-none ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
