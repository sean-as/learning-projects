import "server-only";
import { supabase } from "@/lib/supabase";
import { isActionAllowedInPhase, type BoardAction, type BoardPhase } from "@/lib/board-phase";

export type PhaseCheckResult = { ok: true } | { ok: false; error: string };

/**
 * Shared server-side phase guard, consumed by every phase-dependent action
 * (tasks 9, 11, 12, 13) so each one doesn't reimplement the same lookup.
 * This is a friendly-error pre-check; the database's RLS policies remain
 * the authoritative enforcement (see the cards/card_clusters/votes/
 * action_items migrations) so a request that skips this check is still
 * rejected.
 */
export async function assertPhase(boardId: string, action: BoardAction): Promise<PhaseCheckResult> {
  const { data: board, error } = await supabase.from("boards").select("phase").eq("id", boardId).single();

  if (error || !board) {
    return { ok: false, error: "Board not found." };
  }

  const phase = board.phase as BoardPhase;
  if (!isActionAllowedInPhase(action, phase)) {
    return { ok: false, error: `This action isn't available during the "${phase}" phase.` };
  }

  return { ok: true };
}
