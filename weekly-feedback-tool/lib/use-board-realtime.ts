"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { applyRealtimeEvent, type RealtimeEvent } from "@/lib/realtime-reducer";

/**
 * Streams insert/update/delete events for `table`'s rows belonging to
 * `boardId`, keeping local state in sync. Fetches the current rows on
 * mount, then subscribes for live changes; unsubscribes automatically on
 * unmount or when boardId/table changes.
 */
export function useBoardRealtime<T extends { id: string }>(boardId: string, table: string): T[] {
  const [rows, setRows] = useState<T[]>([]);

  useEffect(() => {
    let cancelled = false;
    setRows([]);

    supabase
      .from(table)
      .select("*")
      .eq("board_id", boardId)
      .then(({ data }) => {
        if (!cancelled && data) {
          setRows(data as T[]);
        }
      });

    const channel = supabase
      .channel(`board-${boardId}-${table}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter: `board_id=eq.${boardId}` },
        (payload) => {
          setRows((current) => applyRealtimeEvent(current, payload as unknown as RealtimeEvent<T>));
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [boardId, table]);

  return rows;
}
