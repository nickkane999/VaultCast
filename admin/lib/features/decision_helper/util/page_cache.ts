import { revalidateTag } from "next/cache";
import { Task, Event, CommonDecision, Project, Essential } from "../types";

export async function fetchDecisionHelperData() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:3000";

  try {
    const [tasksRes, projectsRes, eventsRes, decisionsRes, essentialsRes] = await Promise.all([
      fetch(`${baseUrl}/api/decision_helper/tasks`, {
        next: { revalidate: 300, tags: ["tasks"] },
      }),
      fetch(`${baseUrl}/api/decision_helper/projects`, {
        next: { revalidate: 300, tags: ["projects"] },
      }),
      fetch(`${baseUrl}/api/decision_helper/events`, {
        next: { revalidate: 300, tags: ["events"] },
      }),
      fetch(`${baseUrl}/api/decision_helper/decisions`, {
        next: { revalidate: 300, tags: ["decisions"] },
      }),
      fetch(`${baseUrl}/api/decision_helper/essentials`, {
        next: { revalidate: 300, tags: ["essentials"] },
      }),
    ]);

    const [tasks, projects, events, decisions, essentials] = await Promise.all([tasksRes.ok ? tasksRes.json() : [], projectsRes.ok ? projectsRes.json() : [], eventsRes.ok ? eventsRes.json() : [], decisionsRes.ok ? decisionsRes.json() : [], essentialsRes.ok ? essentialsRes.json() : []]);

    return {
      tasks: tasks.map((item: any) => ({ ...item, type: "task" })),
      projects: projects.map((item: any) => ({ ...item, type: "project" })),
      events: events.map((item: any) => ({ ...item })),
      decisions: decisions.map((item: any) => ({ id: item.id, name: item.name, type: "common_decision" })),
      essentials: essentials.map((item: any) => ({ ...item })),
    };
  } catch (error) {
    console.error("Error fetching decision helper data:", error);
    return {
      tasks: [],
      projects: [],
      events: [],
      decisions: [],
      essentials: [],
    };
  }
}
