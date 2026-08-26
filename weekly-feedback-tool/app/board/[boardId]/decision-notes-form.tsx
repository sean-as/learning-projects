"use client";

import { useActionState } from "react";
import { saveDecisionNotes, type DecisionNotesState } from "./discuss-actions";

const initialState: DecisionNotesState = { error: null };

export function DecisionNotesForm({
  boardId,
  clusterId,
  initialNotes,
}: {
  boardId: string;
  clusterId: string;
  initialNotes: string | null;
}) {
  const boundSave = saveDecisionNotes.bind(null, boardId, clusterId);
  const [, formAction, pending] = useActionState(boundSave, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <textarea
        name="notes"
        defaultValue={initialNotes ?? ""}
        placeholder="Decision notes"
        rows={2}
        className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)]"
      />
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-tint)] disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save notes"}
      </button>
    </form>
  );
}
