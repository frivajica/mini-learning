"use client";

import { useState } from "react";
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useTaskSubscription,
} from "@/hooks";
import { createTask, updateTask, deleteTask } from "@/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

const statusIcons = {
  pending: Circle,
  in_progress: Clock,
  completed: CheckCircle2,
};

const statusColors = {
  pending: "secondary",
  in_progress: "default",
  completed: "secondary",
};

export default function DashboardPage() {
  const { data: tasks, isLoading } = useTasks();
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();
  const subscribe = useTaskSubscription();

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsCreating(true);
    await createMutation.mutateAsync({
      title: newTaskTitle,
      status: "pending",
    });
    setNewTaskTitle("");
    setIsCreating(false);
  };

  const handleToggleStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    await updateMutation.mutateAsync({ id: taskId, status: newStatus });
  };

  const handleDelete = async (taskId: string) => {
    await deleteMutation.mutateAsync(taskId);
  };

  const startRealtime = () => {
    subscribe.data?.();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage your tasks with real-time sync
          </p>
        </div>
        <Button onClick={startRealtime} variant="outline" size="sm">
          Enable Real-time
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateTask} className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Task title..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isCreating || !newTaskTitle.trim()}>
              {isCreating ? "Creating..." : "Create Task"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading tasks...</p>
          ) : tasks?.length === 0 ? (
            <p className="text-muted-foreground">
              No tasks yet. Create one above!
            </p>
          ) : (
            <div className="space-y-4">
              {tasks?.map((task) => {
                const StatusIcon = statusIcons[task.status];
                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleToggleStatus(task.id, task.status)}
                        className="flex-shrink-0"
                      >
                        <StatusIcon
                          className={`h-6 w-6 ${
                            task.status === "completed"
                              ? "text-green-500"
                              : task.status === "in_progress"
                                ? "text-yellow-500"
                                : "text-muted-foreground"
                          }`}
                        />
                      </button>
                      <div>
                        <p
                          className={`font-medium ${
                            task.status === "completed"
                              ? "line-through text-muted-foreground"
                              : ""
                          }`}
                        >
                          {task.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Created {formatDate(task.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          statusColors[task.status] as "default" | "secondary"
                        }
                      >
                        {task.status.replace("_", " ")}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(task.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
