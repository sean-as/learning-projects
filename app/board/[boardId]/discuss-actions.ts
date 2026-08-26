"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { validateActionItemInput } from "@/lib/action-item-validation";
import { assertPhase } from "@/lib/board-phase-guard";

export type ActionItemFormState = { error: string | null };

export async function addActionItem(
  boardId: string,
  clusterId: string,
  _prevState: ActionItemFormState,
  formData: FormData
): Promise<ActionItemFormState> {
  const rawText = (formData.get("text") as string | null) ?? "";
  const rawOwner = (formData.get("owner") as string | null) ?? "";
  const rawDueDate = (formData.get("due_date") as string | null) ?? "";

  const validation = validateActionItemInput(rawText, rawOwner, rawDueDate);
  if (!validation.valid) {
    return { error: validation.error };
  }

  const phaseCheck = await assertPhase(boardId, "add_action_item");
  if (!phaseCheck.ok) {
    return { error: phaseCheck.error };
  }

  const { error } = await supabase.from("action_items").insert({
    board_id: boardId,
    cluster_id: clusterId,
    text: validation.text,
    owner: validation.owner,
    due_date: validation.dueDate,
  });

  if (error) {
    return { error: "Could not save the action item. Please try again." };
  }

  revalidatePath(`/board/${boardId}`);
  return { error: null };
}

export type DecisionNotesState = { error: string | null };

export async function saveDecisionNotes(
  boardId: string,
  clusterId: string,
  _prevState: DecisionNotesState,
  formData: FormData
): Promise<DecisionNotesState> {
  const notes = ((formData.get("notes") as string | null) ?? "").trim();

  await supabase
    .from("clusters")
    .update({ decision_notes: notes.length > 0 ? notes : null })
    .eq("id", clusterId);

  revalidatePath(`/board/${boardId}`);
  return { error: null };
}
