"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/supabase/queries";
import { taskSchema, type TaskInput } from "@/lib/validations";

export async function createTask(input: TaskInput) {
  const result = taskSchema.safeParse(input);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const user = await getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: user.id,
      title: result.data.title,
      description: result.data.description,
      status: result.data.status,
      due_date: result.data.dueDate,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true, task: data };
}

export async function updateTask(taskId: string, input: Partial<TaskInput>) {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("tasks")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true, task: data };
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function getTasks() {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return [];

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return tasks || [];
}
