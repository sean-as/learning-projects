import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
        <Link href="/" className="text-sm font-semibold text-[var(--text)]">
          Weekly Feedback
        </Link>
        <nav className="flex gap-4 text-sm">
          <Link href="/projects" className="text-[var(--text-muted)] hover:text-[var(--text)]">
            Projects
          </Link>
          <Link href="/action-items" className="text-[var(--text-muted)] hover:text-[var(--text)]">
            Action items
          </Link>
        </nav>
      </div>
    </header>
  );
}
