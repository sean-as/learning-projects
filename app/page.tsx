import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-2xl font-semibold text-[var(--text)]">Weekly Feedback Tool</h1>
      <p className="mt-2 text-[var(--text-muted)]">
        Weekly start / stop / continue retrospectives for projects.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/projects"
          className="rounded-md bg-[var(--primary)] px-4 py-2 text-center font-medium text-[var(--text-on-primary)] hover:bg-[var(--primary-hover)]"
        >
          View projects
        </Link>
        <Link
          href="/action-items"
          className="rounded-md border border-[var(--border)] px-4 py-2 text-center font-medium text-[var(--text)] hover:bg-[var(--surface-tint)]"
        >
          View action items
        </Link>
      </div>
    </main>
  );
}
