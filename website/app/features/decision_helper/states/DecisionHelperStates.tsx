import { useState, useEffect } from "react";
import { Event, Task, CommonDecision, Project } from "../types";

export function useDecisionHelperState() {
  const [calendarEvents, setCalendarEvents] = useState<Event[]>([]);
  const [commonDecisions, setCommonDecisions] = useState<CommonDecision[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [eventsRes, decisionsRes, tasksRes, projectsRes] = await Promise.all([fetch("/api/decision_helper/events"), fetch("/api/decision_helper/decisions"), fetch("/api/decision_helper/tasks"), fetch("/api/decision_helper/projects")]);

        const eventsData = eventsRes.ok ? await eventsRes.json() : [];
        const decisionsData = decisionsRes.ok ? await decisionsRes.json() : [];
        const tasksData = tasksRes.ok ? await tasksRes.json() : [];
        const projectsData = projectsRes.ok ? await projectsRes.json() : [];

        setCalendarEvents(eventsData);
        setCommonDecisions(decisionsData.map((item: any) => ({ id: item.id, name: item.name, type: "common_decision" })));
        setTasks(tasksData.filter((item: any) => ({ ...item, type: "task" })));
        setProjects(projectsData.map((item: any) => ({ ...item, type: "project" })));
      } catch (error) {
        console.error("API fetch failed:", error);
        setCalendarEvents([]);
        setCommonDecisions([]);
        setTasks([]);
        setProjects([]);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return {
    calendarEvents,
    commonDecisions,
    tasks,
    projects,
    loading,
    tabValue,
    handleTabChange,
  };
}
