import "server-only";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import { participantCookieName } from "@/lib/participant-validation";

export async function currentParticipantId(boardId: string): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(participantCookieName(boardId))?.value ?? null;
}

/**
 * Any participant can self-claim the facilitator role for a board (no
 * secret token — privacy of the role isn't a product concern). Claiming
 * replaces whoever held it; there is at most one facilitator per board.
 */
export async function checkIsFacilitator(
  boardId: string,
  participantId: string | null
): Promise<boolean> {
  if (!participantId) {
    return false;
  }

  const { data: board } = await supabase
    .from("boards")
    .select("facilitator_participant_id")
    .eq("id", boardId)
    .single();

  return !!board && board.facilitator_participant_id === participantId;
}

/** Guard for facilitator-only server actions (task 15's phase transitions). */
export async function requireFacilitator(boardId: string): Promise<void> {
  const participantId = await currentParticipantId(boardId);
  const ok = await checkIsFacilitator(boardId, participantId);
  if (!ok) {
    throw new Error("Facilitator access required.");
  }
}
