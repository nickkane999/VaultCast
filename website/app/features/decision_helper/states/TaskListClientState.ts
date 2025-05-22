import { useState, useEffect } from "react";
import { Task, Event, CommonDecision, Project } from "../types";
import React from "react";
import { addTask, updateTask, deleteTask } from "../queries/task_queries";
// import { getFilteredAndSortedTasks } from "../util/task_filter"; // Remove or comment out incorrect import

interface TaskFormState {
  name: string;
  is_completed: boolean;
  tags: string[];
  projectId?: string | undefined;
}

interface UseTaskListClientStateProps {
  initialTasks: Task[];
  initialProjects: Project[];
}

export function useTaskListClientState({ initialTasks, initialProjects }: UseTaskListClientStateProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks || []);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState<TaskFormState>({
    name: "",
    is_completed: false,
    tags: [],
    projectId: undefined,
  });
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [editedTaskTags, setEditedTaskTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [taskDecisions, setTaskDecisions] = useState<Record<string, number>>({});

  const [tagFilter, setTagFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "Completed" | "Not Completed">("Not Completed");
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [addTagInputValue, setAddTagInputValue] = useState<string>("");
  const [newTagInput, setNewTagInput] = useState<string>("");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | null } | null>(null);
  const [projectFilter, setProjectFilter] = useState<string | "All">("All");

  // Fetch tasks and projects when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tasks
        const tasksResponse = await fetch("/api/decision_helper/tasks");
        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          setTasks(tasksData);
        } else {
          console.error("Failed to fetch tasks:", await tasksResponse.json());
        }

        // Fetch projects
        const projectsResponse = await fetch("/api/decision_helper/projects");
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          setProjects(projectsData);
        } else {
          console.error("Failed to fetch projects:", await projectsResponse.json());
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleAddTaskCard = () => {
    setNewTask({ name: "", is_completed: false, tags: [], projectId: undefined });
    setAddTagInputValue("");
    setNewTagInput("");
    setShowForm(true);
  };

  const collectUniqueTags = (currentTasks: Task[]) => {
    const tags = new Set<string>();
    currentTasks.forEach((task) => {
      if (task.tags) {
        task.tags.forEach((tag) => tags.add(tag));
      }
    });
    setAvailableTags(Array.from(tags));
  };

  useEffect(() => {
    collectUniqueTags(tasks);
  }, [tasks]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (name !== "tags") {
      setNewTask({ ...newTask, [name]: type === "checkbox" ? checked : value });
    }
  };

  const handleProjectChange = (projectId: string | undefined) => {
    setNewTask({ ...newTask, projectId });
  };

  const handleEditProjectChange = (projectId: string | undefined) => {
    if (editedTask) {
      setEditedTask({ ...editedTask, projectId } as Task);
    }
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (editedTask && name !== "tags") {
      setEditedTask({ ...editedTask, [name]: type === "checkbox" ? checked : value } as Task);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.name) return;
    setLoading(true);

    try {
      const addedTask = await addTask({
        name: newTask.name,
        is_completed: newTask.is_completed,
        tags: newTask.tags,
        projectId: newTask.projectId,
      });
      setTasks((prev) => [...prev, addedTask]);
      setNewTask({ name: "", is_completed: false, tags: [], projectId: undefined });
      setShowForm(false);
    } catch (error: any) {
      console.error("Error adding task:", error);
      // Optionally show a user-friendly error message
    }
    setLoading(false);
  };

  const handleEditFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedTask || !editedTask.name) return;
    setLoading(true);
    try {
      const updatedTask = await updateTask(editingId!, {
        // Use non-null assertion as we check editingId is not null before this
        name: editedTask.name,
        is_completed: editedTask.is_completed,
        tags: editedTaskTags,
        projectId: editedTask.projectId,
      });
      setTasks((prev) => prev.map((task) => (task.id === editingId ? updatedTask : task)));
      setEditingId(null);
      setEditedTask(null);
      setNotification({ message: `Task "${updatedTask.name}" updated successfully.`, type: "success" });
    } catch (error: any) {
      console.error("Error updating task:", error);
      setNotification({ message: error.message || "Failed to update task.", type: "error" });
    }
    setLoading(false);
  };

  const handleDelete = async (id: string | number) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (error: any) {
      console.error("Error deleting task:", error);
      // Optionally show a user-friendly error message
    }
  };

  const handleEdit = (item: Event | CommonDecision | Task) => {
    setEditingId(item.id);
    setEditedTask(item as Task);
    setEditedTaskTags((item as Task).tags || []);
  };

  const handleToggleComplete = async (item: Task) => {
    setLoading(true);
    try {
      const updatedTask = await updateTask(item.id!, { name: item.name, is_completed: !item.is_completed }); // Use non-null assertion as item.id exists for existing tasks
      setTasks((prev) => prev.map((task) => (task.id === item.id ? updatedTask : task)));
      setNotification({
        message: `Task "${updatedTask.name}" marked as ${updatedTask.is_completed ? "completed" : "not completed"}.`,
        type: updatedTask.is_completed ? "success" : "error",
      });
    } catch (error: any) {
      console.error("Error updating task completion status:", error);
      setNotification({ message: error.message || "Failed to update task completion status.", type: "error" });
    }
    setLoading(false);
  };

  const handleDecision = (id: string | number) => {
    const randomNum = Math.floor(Math.random() * 100) + 1;
    setTaskDecisions((prev) => ({ ...prev, [id]: randomNum }));
  };

  const getFilteredAndSortedTasks = () => {
    const filtered = tasks.filter((task) => {
      if (statusFilter !== "All") {
        if (statusFilter === "Completed" && !task.is_completed) {
          return false;
        }
        if (statusFilter !== "Completed" && task.is_completed) {
          return false;
        }
      }
      if (tagFilter !== "All") {
        if (!task.tags) return false;
        if (!task.tags.includes(tagFilter)) return false;
      }
      if (projectFilter !== "All") {
        if (projectFilter === "no-project" && task.projectId) {
          return false;
        }
        if (projectFilter !== "no-project" && task.projectId !== projectFilter) {
          return false;
        }
      }

      return true; // Keep the task if it passes all filters
    });
    return filtered;
  };

  const displayedTasks = getFilteredAndSortedTasks();

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    setNewTask({ ...newTask, tags: [...newTask.tags, newTagInput.trim()] });
    setNewTagInput("");
    setAddTagInputValue("");
  };

  const handleTagChange = (_event: any, newValue: string[]) => {
    // Do not handle tags here, Autocomplete handles it directly
  };

  const handleProjectFilterChange = (projectId: string | "All") => {
    setProjectFilter(projectId);
  };

  return {
    tasks,
    projects,
    showForm,
    newTask,
    editingId,
    editedTask,
    loading,
    taskDecisions,
    tagFilter,
    statusFilter,
    availableTags,
    editedTaskTags,
    addTagInputValue,
    newTagInput,
    notification,
    projectFilter,
    handleAddTaskCard,
    handleFormChange,
    handleProjectChange,
    handleEditProjectChange,
    handleEditFormChange,
    handleFormSubmit,
    handleEditFormSubmit,
    handleDelete,
    handleEdit,
    handleToggleComplete,
    handleDecision,
    getFilteredAndSortedTasks,
    displayedTasks,
    handleAddTag,
    handleTagChange,
    handleProjectFilterChange,
    setShowForm,
    setNewTask,
    setEditingId,
    setEditedTask,
    setTagFilter,
    setStatusFilter,
    setEditedTaskTags,
    setAddTagInputValue,
    setNewTagInput,
    setNotification,
  };
}
