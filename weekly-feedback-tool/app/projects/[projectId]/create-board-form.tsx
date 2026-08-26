"use client";

import { useActionState } from "react";
import { createBoard, type CreateBoardState } from "./actions";

const initialState: CreateBoardState = { error: null };

export function CreateBoardForm({ projectId }: { projectId: string }) {
  const boundCreateBoard = createBoard.bind(null, projectId);
  const [state, formAction, pending] = useActionState(boundCreateBoard, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-sm font-medium text-[var(--text)]">
        Week
        <input
          type="date"
          name="week"
          required
          className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)]"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--text-on-primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50"
      >
        {pending ? "Opening…" : "Open / create board"}
      </button>
      {state.error && <p role="alert" className="w-full text-sm text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}
