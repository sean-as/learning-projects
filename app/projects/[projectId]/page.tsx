import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CreateBoardForm } from "./create-board-form";

export const dynamic = "force-dynamic";

const PHASE_STYLES: Record<string, string> = {
  submit: "bg-highlight-100 text-neutral-800",
  cluster: "bg-highlight-400 text-neutral-900",
  vote: "bg-success-100 text-success-700",
  discuss: "bg-success-100 text-success-700",
  closed: "bg-neutral-200 text-neutral-700",
};

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, name, description")
    .eq("id", projectId)
    .single();

  if (!project) {
    if (projectError && projectError.code !== "PGRST116") {
      throw new Error(`Could not load project ${projectId}: ${projectError.message}`);
    }
    notFound();
  }

  const { data: boards } = await supabase
    .from("boards")
    .select("id, week, phase")
    .eq("project_id", projectId)
    .order("week", { ascending: false });

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-[var(--text)]">{project.name}</h1>
      {project.description && <p className="mt-2 text-[var(--text-muted)]">{project.description}</p>}

      <h2 className="mt-10 text-lg font-medium text-[var(--text)]">Weekly boards</h2>
      {!boards || boards.length === 0 ? (
        <p className="mt-2 text-[var(--text-muted)]">No boards yet for this project.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {boards.map((board) => (
            <li key={board.id}>
              <Link
                href={`/board/${board.id}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 hover:bg-[var(--surface-tint)]"
              >
                <span className="font-medium text-[var(--text)]">Week of {board.week}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    PHASE_STYLES[board.phase] ?? "bg-neutral-200 text-neutral-700"
                  }`}
                >
                  {board.phase}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-10 text-lg font-medium text-[var(--text)]">Open or start a week</h2>
      <div className="mt-3">
        <CreateBoardForm projectId={projectId} />
      </div>
    </main>
  );
}
