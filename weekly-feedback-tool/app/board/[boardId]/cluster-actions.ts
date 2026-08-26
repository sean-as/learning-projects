"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { validateClusterName } from "@/lib/cluster-validation";
import { assertPhase } from "@/lib/board-phase-guard";

async function clearExistingMembership(cardId: string): Promise<void> {
  await supabase.from("card_clusters").delete().eq("card_id", cardId);
}

/**
 * Drop a card onto another ungrouped card: creates a new cluster and adds
 * both cards to it.
 */
export async function groupCardsIntoNewCluster(
  boardId: string,
  draggedCardId: string,
  targetCardId: string
): Promise<void> {
  if (draggedCardId === targetCardId) {
    return;
  }

  const phaseCheck = await assertPhase(boardId, "cluster_cards");
  if (!phaseCheck.ok) {
    return;
  }

  const { data: cluster, error } = await supabase
    .from("clusters")
    .insert({ board_id: boardId, name: "Untitled" })
    .select("id")
    .single();

  if (error || !cluster) {
    return;
  }

  await clearExistingMembership(draggedCardId);
  await clearExistingMembership(targetCardId);

  await supabase.from("card_clusters").insert([
    { card_id: draggedCardId, cluster_id: cluster.id, board_id: boardId },
    { card_id: targetCardId, cluster_id: cluster.id, board_id: boardId },
  ]);

  revalidatePath(`/board/${boardId}`);
}

/** Drop a card onto an existing cluster (or another card already in one). */
export async function addCardToCluster(
  boardId: string,
  cardId: string,
  clusterId: string
): Promise<void> {
  const phaseCheck = await assertPhase(boardId, "cluster_cards");
  if (!phaseCheck.ok) {
    return;
  }

  await clearExistingMembership(cardId);
  await supabase.from("card_clusters").insert({ card_id: cardId, cluster_id: clusterId, board_id: boardId });
  revalidatePath(`/board/${boardId}`);
}

/** Drop a card onto the "Ungrouped" zone. */
export async function removeCardFromCluster(boardId: string, cardId: string): Promise<void> {
  const phaseCheck = await assertPhase(boardId, "cluster_cards");
  if (!phaseCheck.ok) {
    return;
  }

  await clearExistingMembership(cardId);
  revalidatePath(`/board/${boardId}`);
}

export type RenameClusterState = { error: string | null };

export async function renameCluster(
  boardId: string,
  clusterId: string,
  _prevState: RenameClusterState,
  formData: FormData
): Promise<RenameClusterState> {
  const rawName = (formData.get("name") as string | null) ?? "";
  const validation = validateClusterName(rawName);
  if (!validation.valid) {
    return { error: validation.error };
  }

  await supabase.from("clusters").update({ name: validation.name }).eq("id", clusterId);
  revalidatePath(`/board/${boardId}`);
  return { error: null };
}
