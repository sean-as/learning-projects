"use client";

import { useActionState } from "react";
import { renameCluster, type RenameClusterState } from "./cluster-actions";

const initialState: RenameClusterState = { error: null };

export function ClusterNameForm({
  boardId,
  clusterId,
  initialName,
}: {
  boardId: string;
  clusterId: string;
  initialName: string;
}) {
  const boundRename = renameCluster.bind(null, boardId, clusterId);
  const [state, formAction, pending] = useActionState(boundRename, initialState);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input
        type="text"
        name="name"
        defaultValue={initialName}
        maxLength={80}
        className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-sm font-medium text-[var(--text)]"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-[var(--border)] px-2 py-1 text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-tint)] disabled:opacity-50"
      >
        Rename
      </button>
      {state.error && <span role="alert" className="text-xs text-red-600 dark:text-red-400">{state.error}</span>}
    </form>
  );
}
