import { Task } from "../types";

export async function addTask(task: Omit<Task, "id" | "type">) {
  const response = await fetch("/api/decision_helper/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to add task");
  }
  return response.json();
}

export async function updateTask(id: string | number, taskData: Partial<Omit<Task, "id" | "type">>) {
  const response = await fetch(`/api/decision_helper/tasks?id=${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update task");
  }
  return response.json();
}

export async function deleteTask(id: string | number) {
  const response = await fetch(`/api/decision_helper/tasks?id=${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete task");
  }
  return response;
}
