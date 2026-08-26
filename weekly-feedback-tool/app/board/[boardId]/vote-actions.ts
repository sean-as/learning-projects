"use server";

import { cookies } from "next/headers";
import { createParticipantClient } from "@/lib/supabase-server";
import { participantCookieName } from "@/lib/participant-validation";
import { assertPhase } from "@/lib/board-phase-guard";

export type VoteState = { error: string | null };

export async function castVote(boardId: string, clusterId: string): Promise<VoteState> {
  const cookieStore = await cookies();
  const participantId = cookieStore.get(participantCookieName(boardId))?.value;
  if (!participantId) {
    return { error: "Join the board before voting." };
  }

  const phaseCheck = await assertPhase(boardId, "cast_vote");
  if (!phaseCheck.ok) {
    return { error: phaseCheck.error };
  }

  const client = createParticipantClient(participantId);
  const { error } = await client.from("votes").insert({
    cluster_id: clusterId,
    participant_id: participantId,
  });

  if (error) {
    return { error: "Could not cast vote — you may be out of votes, or voting isn't open." };
  }

  return { error: null };
}
