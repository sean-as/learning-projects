"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { validateProjectInput } from "@/lib/project-validation";

export type CreateProjectState = { error: string | null };

export async function createProject(
  _prevState: CreateProjectState,
  formData: FormData
): Promise<CreateProjectState> {
  const rawName = (formData.get("name") as string | null) ?? "";
  const rawDescription = (formData.get("description") as string | null) ?? "";

  const validation = validateProjectInput(rawName, rawDescription);
  if (!validation.valid) {
    return { error: validation.error };
  }

  const { error } = await supabase.from("projects").insert({
    name: validation.name,
    description: validation.description,
  });

  if (error) {
    return { error: "Could not create the project. Please try again." };
  }

  revalidatePath("/projects");
  return { error: null };
}
