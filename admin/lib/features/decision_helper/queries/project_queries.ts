import { Project } from "../types";

export async function addProject(project: Omit<Project, "id">) {
  const response = await fetch("/api/decision_helper/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(project),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to add project");
  }
  return response.json();
}

export async function updateProject(id: string | number, project: Omit<Project, "id" | "type">) {
  const response = await fetch(`/api/decision_helper/projects?id=${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(project),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update project");
  }
  return response.json();
}

export async function deleteProject(id: string | number) {
  const response = await fetch(`/api/decision_helper/projects?id=${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete project");
  }
  return response;
}
