import { getCollection } from "@/lib/server/mongodb";
import { Task, Event, CommonDecision, Project, Essential } from "../types";

export async function fetchDecisionHelperData() {
  try {
    const [tasksData, eventsData, projectsData, decisionsData, essentialsData] = await Promise.all([fetchTasks(), fetchEvents(), fetchProjects(), fetchCommonDecisions(), fetchEssentials()]);

    return {
      tasks: tasksData,
      events: eventsData,
      projects: projectsData,
      decisions: decisionsData,
      essentials: essentialsData,
    };
  } catch (error) {
    console.error("Error fetching decision helper data:", error);
    return {
      tasks: [],
      events: [],
      projects: [],
      decisions: [],
      essentials: [],
    };
  }
}

async function fetchTasks(): Promise<Task[]> {
  try {
    const collection = await getCollection("decision_helper_tasks");
    const tasks = await collection.find({}).toArray();
    return tasks.map((task) => ({
      id: task._id.toString(),
      name: task.name,
      date: task.date,
      is_completed: task.is_completed,
      tags: task.tags,
      startTime: task.startTime,
      endTime: task.endTime,
      attended: task.attended,
      projectId: task.projectId,
      complete_description: task.complete_description,
    }));
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
}

async function fetchEvents(): Promise<Event[]> {
  try {
    const collection = await getCollection("decision_helper_events");
    const events = await collection.find({}).sort({ date: 1, startTime: 1 }).toArray();
    return events.map((event) => ({
      id: event._id.toString(),
      name: event.name,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      attended: event.attended,
    }));
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

async function fetchProjects(): Promise<Project[]> {
  try {
    const collection = await getCollection("decision_helper_projects");
    const projects = await collection.find({}).sort({ dueDate: 1 }).toArray();
    return projects.map((project) => ({
      id: project._id.toString(),
      name: project.name,
      description: project.description,
      dueDate: project.dueDate,
      is_completed: project.is_completed || false,
      complete_description: project.complete_description,
    }));
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

async function fetchCommonDecisions(): Promise<CommonDecision[]> {
  try {
    const collection = await getCollection("decision_helper_common_decisions");
    const decisions = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return decisions.map((decision) => ({
      id: decision._id.toString(),
      name: decision.name,
    }));
  } catch (error) {
    console.error("Error fetching common decisions:", error);
    return [];
  }
}

async function fetchEssentials(): Promise<Essential[]> {
  try {
    const collection = await getCollection("decision_helper_essentials");
    const essentials = await collection.find({}).sort({ due_date: 1 }).toArray();
    return essentials.map((essential) => ({
      id: essential._id.toString(),
      title: essential.title,
      description: essential.description,
      completed_times: essential.completed_times,
      due_date: essential.due_date,
      interval: essential.interval,
    }));
  } catch (error) {
    console.error("Error fetching essentials:", error);
    return [];
  }
}
