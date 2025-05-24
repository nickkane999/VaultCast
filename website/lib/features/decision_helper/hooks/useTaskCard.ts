import { Task, Project } from "../types";
export function useTaskCard({ item, projects }: { item: Task; projects: Project[] }) {
  const projectName = item.projectId ? projects.find((project) => project.id === item.projectId)?.name || null : null;
  return { projectName };
}
