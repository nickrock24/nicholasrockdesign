export function Footer() {
  return (
    <footer className="mt-auto border-t border-black/10">
      <div className="mx-auto w-full max-w-[1800px] px-6 py-8 font-mono text-sm text-black/60 sm:px-10 lg:px-16">
        &copy; {new Date().getFullYear()} Nicholas Rock
      </div>
    </footer>
  );
}
