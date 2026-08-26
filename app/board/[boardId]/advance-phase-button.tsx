"use client";

import { advancePhase } from "./phase-actions";

export function AdvancePhaseButton({ boardId, label }: { boardId: string; label: string }) {
  return (
    <form action={advancePhase.bind(null, boardId)}>
      <button
        type="submit"
        className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--text-on-primary)] hover:bg-[var(--primary-hover)]"
      >
        {label}
      </button>
    </form>
  );
}
