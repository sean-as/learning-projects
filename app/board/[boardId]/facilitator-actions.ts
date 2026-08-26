"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { currentParticipantId } from "@/lib/facilitator";

/** Any joined participant can claim facilitator; claiming replaces whoever had it. */
export async function becomeFacilitator(boardId: string): Promise<void> {
  const participantId = await currentParticipantId(boardId);
  if (!participantId) {
    return;
  }

  await supabase
    .from("boards")
    .update({ facilitator_participant_id: participantId })
    .eq("id", boardId);

  revalidatePath(`/board/${boardId}`);
}
