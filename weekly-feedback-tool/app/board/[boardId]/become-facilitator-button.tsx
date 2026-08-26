"use client";

import { becomeFacilitator } from "./facilitator-actions";

export function BecomeFacilitatorButton({ boardId, label }: { boardId: string; label: string }) {
  return (
    <form action={becomeFacilitator.bind(null, boardId)}>
      <button
        type="submit"
        className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-tint)]"
      >
        {label}
      </button>
    </form>
  );
}
