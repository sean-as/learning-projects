"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { requireFacilitator } from "@/lib/facilitator";
import { nextPhase, type BoardPhase } from "@/lib/board-phase";

/** Facilitator-only: advance the board to the single next phase in the sequence. */
export async function advancePhase(boardId: string): Promise<void> {
  await requireFacilitator(boardId);

  const { data: board } = await supabase.from("boards").select("phase").eq("id", boardId).single();
  if (!board) {
    return;
  }

  const currentPhase = board.phase as BoardPhase;
  const target = nextPhase(currentPhase);
  if (!target) {
    return;
  }

  await supabase.from("boards").update({ phase: target }).eq("id", boardId).eq("phase", currentPhase);

  revalidatePath(`/board/${boardId}`);
}
