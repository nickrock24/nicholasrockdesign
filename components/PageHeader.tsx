/**
 * Asymmetric masthead: H1 sits alone in the rightmost of 3 columns; an
 * optional intro block starts one column to the left, top-aligned with the
 * H1 on the same grid row. The intro is confined to column 2 (not spanning
 * into column 3) so its text never collides with the H1's glyphs. Stacks to
 * a single column below the `sm` breakpoint, where 3 equal columns would
 * squeeze the intro text down to one word per line.
 */
export function PageHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-3 sm:items-start sm:gap-x-8">
      <h1 className="text-4xl leading-none font-semibold sm:col-start-3 sm:row-start-1 sm:text-5xl">
        {title}
      </h1>
      {children ? (
        <div className="sm:col-start-2 sm:row-start-1">{children}</div>
      ) : null}
    </div>
  );
}
