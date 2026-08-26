"use server";

import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { validateWeekInput } from "@/lib/week-validation";

export type CreateBoardState = { error: string | null };

export async function createBoard(
  projectId: string,
  _prevState: CreateBoardState,
  formData: FormData
): Promise<CreateBoardState> {
  const rawWeek = (formData.get("week") as string | null) ?? "";

  const validation = validateWeekInput(rawWeek);
  if (!validation.valid) {
    return { error: validation.error };
  }

  const { data: inserted, error: insertError } = await supabase
    .from("boards")
    .insert({ project_id: projectId, week: validation.week })
    .select("id")
    .single();

  if (!insertError && inserted) {
    redirect(`/board/${inserted.id}`);
  }

  // Unique violation on (project_id, week): a board for this week already
  // exists — route to it instead of creating a duplicate.
  const { data: existing } = await supabase
    .from("boards")
    .select("id")
    .eq("project_id", projectId)
    .eq("week", validation.week)
    .single();

  if (existing) {
    redirect(`/board/${existing.id}`);
  }

  return { error: "Could not create the board. Please try again." };
}
