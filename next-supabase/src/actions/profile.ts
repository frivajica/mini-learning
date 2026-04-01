"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  profileUpdateSchema,
  type ProfileUpdateInput,
} from "@/lib/validations";
import { getUser } from "@/lib/supabase/queries";

export async function updateProfile(input: ProfileUpdateInput) {
  const result = profileUpdateSchema.safeParse(input);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const user = await getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: result.data.fullName,
      avatar_url: result.data.avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function getProfile() {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}
