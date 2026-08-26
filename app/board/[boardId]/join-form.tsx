"use client";

import { useActionState } from "react";
import { joinBoard, type JoinFormState } from "./actions";

const initialState: JoinFormState = { error: null };

export function JoinForm({ boardId }: { boardId: string }) {
  const boundJoinBoard = joinBoard.bind(null, boardId);
  const [state, formAction, pending] = useActionState(boundJoinBoard, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3 max-w-sm">
      <label className="flex flex-col gap-1 text-sm font-medium text-[var(--text)]">
        Name
        <input
          type="text"
          name="name"
          maxLength={60}
          autoComplete="off"
          className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)]"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-[var(--text)]">
        <input type="checkbox" name="anonymous" className="rounded border-[var(--border)]" /> Stay anonymous
      </label>
      {state.error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--text-on-primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50"
      >
        {pending ? "Joining…" : "Join board"}
      </button>
    </form>
  );
}
