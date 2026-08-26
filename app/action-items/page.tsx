import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  text: string;
  owner: string;
  due_date: string;
  boards: {
    week: string;
    projects: { id: string; name: string } | null;
  } | null;
};

export default async function ActionItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; project?: string }>;
}) {
  const { week: weekFilter, project: projectFilter } = await searchParams;

  const { data } = await supabase
    .from("action_items")
    .select("id, text, owner, due_date, boards(week, projects(id, name))")
    .order("due_date", { ascending: true });

  const items = (data ?? []) as unknown as Row[];

  const weeks = Array.from(new Set(items.map((item) => item.boards?.week).filter(Boolean))).sort();
  const projects = Array.from(
    new Map(
      items
        .map((item) => item.boards?.projects)
        .filter((p): p is { id: string; name: string } => Boolean(p))
        .map((p) => [p.id, p])
    ).values()
  );

  const filtered = items.filter((item) => {
    if (weekFilter && item.boards?.week !== weekFilter) {
      return false;
    }
    if (projectFilter && item.boards?.projects?.id !== projectFilter) {
      return false;
    }
    return true;
  });

  const selectClass =
    "rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)]";

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-[var(--text)]">Action items</h1>

      <form method="get" className="mt-6 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-[var(--text)]">
          Week
          <select name="week" defaultValue={weekFilter ?? ""} className={selectClass}>
            <option value="">All weeks</option>
            {weeks.map((week) => (
              <option key={week} value={week}>
                {week}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-[var(--text)]">
          Project
          <select name="project" defaultValue={projectFilter ?? ""} className={selectClass}>
            <option value="">All projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--text-on-primary)] hover:bg-[var(--primary-hover)]"
        >
          Filter
        </button>
      </form>

      {filtered.length === 0 ? (
        <p className="mt-8 text-[var(--text-muted)]">No action items found.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-[var(--border)]">
          <table className="w-full min-w-max border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-tint)] text-left">
                <th className="px-4 py-2 font-medium text-[var(--text)]">Due</th>
                <th className="px-4 py-2 font-medium text-[var(--text)]">Text</th>
                <th className="px-4 py-2 font-medium text-[var(--text)]">Owner</th>
                <th className="px-4 py-2 font-medium text-[var(--text)]">Project</th>
                <th className="px-4 py-2 font-medium text-[var(--text)]">Week</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-2 whitespace-nowrap text-[var(--text)]">{item.due_date}</td>
                  <td className="px-4 py-2 text-[var(--text)]">{item.text}</td>
                  <td className="px-4 py-2 text-[var(--text)]">{item.owner}</td>
                  <td className="px-4 py-2 text-[var(--text-muted)]">{item.boards?.projects?.name ?? "—"}</td>
                  <td className="px-4 py-2 text-[var(--text-muted)]">{item.boards?.week ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
