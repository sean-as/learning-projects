"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { participantCookieName, validateJoinInput } from "@/lib/participant-validation";

export type JoinFormState = { error: string | null };

export async function joinBoard(
  boardId: string,
  _prevState: JoinFormState,
  formData: FormData
): Promise<JoinFormState> {
  const rawName = (formData.get("name") as string | null) ?? "";
  const anonymous = formData.get("anonymous") === "on";

  const validation = validateJoinInput(rawName, anonymous);
  if (!validation.valid) {
    return { error: validation.error };
  }

  const { data, error } = await supabase
    .from("participants")
    .insert({
      board_id: boardId,
      name: validation.name,
      is_anonymous: anonymous,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Could not join the board. Please try again." };
  }

  const cookieStore = await cookies();
  cookieStore.set(participantCookieName(boardId), data.id, {
    httpOnly: true,
    sameSite: "lax",
    path: `/board/${boardId}`,
    maxAge: 60 * 60 * 24 * 180,
  });

  redirect(`/board/${boardId}`);
}
