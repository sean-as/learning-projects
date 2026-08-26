import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { CreateProjectForm } from "./create-project-form";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, description, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-[var(--text)]">Projects</h1>

      {!projects || projects.length === 0 ? (
        <p className="mt-4 text-[var(--text-muted)]">No projects yet. Create one below to get started.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {projects.map((project) => (
            <li
              key={project.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <Link
                href={`/projects/${project.id}`}
                className="font-medium text-[var(--primary)] hover:underline"
              >
                {project.name}
              </Link>
              {project.description && (
                <p className="mt-1 text-sm text-[var(--text-muted)]">{project.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-10 text-lg font-medium text-[var(--text)]">New project</h2>
      <div className="mt-3">
        <CreateProjectForm />
      </div>
    </main>
  );
}
