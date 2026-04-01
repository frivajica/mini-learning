"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Task } from "@/lib/supabase/types";

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const supabase = createClient();
      const { data: tasks } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });
      return tasks as Task[];
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: {
      title: string;
      description?: string | null;
      status?: "pending" | "in_progress" | "completed";
      due_date?: string | null;
    }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("tasks")
        .insert(task)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...task }: Partial<Task> & { id: string }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("tasks")
        .update(task)
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("tasks").delete().eq("id", id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useTaskSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const supabase = createClient();

      const channel = supabase
        .channel("tasks-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "tasks" },
          () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    },
  });
}
