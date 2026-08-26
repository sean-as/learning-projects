"use client";

import { useActionState, useEffect, useRef } from "react";
import { createProject, type CreateProjectState } from "./actions";

const initialState: CreateProjectState = { error: null };

export function CreateProjectForm() {
  const [state, formAction, pending] = useActionState(createProject, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && state.error === null) {
      formRef.current?.reset();
    }
  }, [pending, state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3 max-w-sm">
      <label className="flex flex-col gap-1 text-sm font-medium text-[var(--text)]">
        Name
        <input
          type="text"
          name="name"
          maxLength={120}
          required
          className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)]"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-[var(--text)]">
        Description (optional)
        <textarea
          name="description"
          maxLength={500}
          className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)]"
        />
      </label>
      {state.error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--text-on-primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create project"}
      </button>
    </form>
  );
}
