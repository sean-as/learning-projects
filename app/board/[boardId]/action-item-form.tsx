"use client";

import { useActionState, useEffect, useRef } from "react";
import { addActionItem, type ActionItemFormState } from "./discuss-actions";

const initialState: ActionItemFormState = { error: null };

export function ActionItemForm({ boardId, clusterId }: { boardId: string; clusterId: string }) {
  const boundAdd = addActionItem.bind(null, boardId, clusterId);
  const [state, formAction, pending] = useActionState(boundAdd, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && state.error === null) {
      formRef.current?.reset();
    }
  }, [pending, state]);

  const inputClass =
    "rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)]";

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="text" name="text" placeholder="Action item" maxLength={280} className={`${inputClass} flex-1 min-w-40`} />
      <input type="text" name="owner" placeholder="Owner" maxLength={80} className={`${inputClass} w-32`} />
      <input type="date" name="due_date" className={inputClass} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-[var(--primary)] px-3 py-2 text-sm font-medium text-[var(--text-on-primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50"
      >
        {pending ? "Adding…" : "Add"}
      </button>
      {state.error && <p role="alert" className="w-full text-xs text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}
