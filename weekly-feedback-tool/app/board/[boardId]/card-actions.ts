"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createParticipantClient } from "@/lib/supabase-server";
import { participantCookieName } from "@/lib/participant-validation";
import { validateCardInput } from "@/lib/card-validation";
import { assertPhase } from "@/lib/board-phase-guard";

export type CardFormState = { error: string | null };

async function currentParticipantId(boardId: string): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(participantCookieName(boardId))?.value ?? null;
}

export async function addCard(
  boardId: string,
  _prevState: CardFormState,
  formData: FormData
): Promise<CardFormState> {
  const participantId = await currentParticipantId(boardId);
  if (!participantId) {
    return { error: "You need to join the board before adding cards." };
  }

  const phaseCheck = await assertPhase(boardId, "submit_card");
  if (!phaseCheck.ok) {
    return { error: phaseCheck.error };
  }

  const rawCategory = (formData.get("category") as string | null) ?? "";
  const rawContent = (formData.get("content") as string | null) ?? "";

  const validation = validateCardInput(rawCategory, rawContent);
  if (!validation.valid) {
    return { error: validation.error };
  }

  const client = createParticipantClient(participantId);
  const { error } = await client.from("cards").insert({
    board_id: boardId,
    participant_id: participantId,
    category: validation.category,
    content: validation.content,
  });

  if (error) {
    return { error: "Could not add the card. Please try again." };
  }

  revalidatePath(`/board/${boardId}`);
  return { error: null };
}

export async function deleteCard(boardId: string, cardId: string): Promise<void> {
  const participantId = await currentParticipantId(boardId);
  if (!participantId) {
    return;
  }

  const client = createParticipantClient(participantId);
  await client.from("cards").delete().eq("id", cardId);

  revalidatePath(`/board/${boardId}`);
}
