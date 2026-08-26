"use client";

import { useBoardRealtime } from "@/lib/use-board-realtime";
import { supabase } from "@/lib/supabase";

type ClusterRow = { id: string; board_id: string; name: string };

export function RealtimeDemo({ boardId }: { boardId: string }) {
  const clusters = useBoardRealtime<ClusterRow>(boardId, "clusters");

  async function addTestRow() {
    await supabase.from("clusters").insert({
      board_id: boardId,
      name: `Test cluster ${new Date().toLocaleTimeString()}`,
    });
  }

  return (
    <div>
      <button onClick={addTestRow}>Add test row</button>
      <ul>
        {clusters.map((cluster) => (
          <li key={cluster.id}>{cluster.name}</li>
        ))}
      </ul>
    </div>
  );
}
