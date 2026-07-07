export function Footer() {
  return (
    <footer className="mt-auto border-t border-black/10">
      <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-black/60">
        &copy; {new Date().getFullYear()} Nicholas Rock
      </div>
    </footer>
  );
}
