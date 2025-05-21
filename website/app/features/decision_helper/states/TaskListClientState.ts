import { useState, useEffect } from "react";
import { Task, Event, CommonDecision } from "../types";
import React from "react";

interface TaskFormState {
  name: string;
  is_completed: boolean;
  tags: string[];
}

interface UseTaskListClientStateProps {
  initialTasks?: Task[];
}

export function useTaskListClientState({ initialTasks = [] }: UseTaskListClientStateProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState<TaskFormState>({ name: "", is_completed: false, tags: [] });
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [taskDecisions, setTaskDecisions] = useState<Record<string, number>>({});

  const [tagFilter, setTagFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "Completed" | "Not Completed">("Not Completed");
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [editedTaskTags, setEditedTaskTags] = useState<string[]>([]);
  const [addTagInputValue, setAddTagInputValue] = useState<string>("");
  const [newTagInput, setNewTagInput] = useState<string>("");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | null } | null>(null);

  const handleAddTaskCard = () => {
    setNewTask({ name: "", is_completed: false, tags: [] });
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
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTask.name,
          type: "task",
          is_completed: newTask.is_completed,
          tags: newTask.tags,
        }),
      });
      if (response.ok) {
        const addedTask = await response.json();
        setTasks((prev) => [...prev, addedTask]);
        setNewTask({ name: "", is_completed: false, tags: [] });
        setShowForm(false);
      } else {
        console.error("Failed to add task:", await response.json());
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
    setLoading(false);
  };

  const handleEditFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedTask || !editedTask.name) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/events?id=${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editedTask.name,
          type: "task",
          is_completed: editedTask.is_completed,
          tags: editedTaskTags,
        }),
      });
      if (response.ok) {
        const updatedTask = await response.json();
        setTasks((prev) => prev.map((task) => (task.id === editingId ? updatedTask : task)));
        setEditingId(null);
        setEditedTask(null);
        setNotification({ message: `Task "${updatedTask.name}" marked as ${updatedTask.is_completed ? "completed" : "not completed"}.`, type: "success" });
      } else {
        console.error("Failed to update task:", await response.json());
        setNotification({ message: "Failed to update task completion status.", type: "error" });
      }
    } catch (error) {
      console.error("Error updating task:", error);
      setNotification({ message: "An error occurred while updating task completion status.", type: "error" });
    }
    setLoading(false);
  };

  const handleDelete = async (id: string | number) => {
    try {
      const response = await fetch(`/api/events?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setTasks((prev) => prev.filter((task) => task.id !== id));
      } else {
        console.error("Failed to delete task:", await response.json());
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleEdit = (item: Event | CommonDecision | Task) => {
    if (item.type === "task") {
      setEditingId(item.id);
      setEditedTask(item as Task);
      setEditedTaskTags((item as Task).tags || []);
    } else {
      console.error("Attempted to edit a non-task item in TaskListClient");
    }
  };

  const handleToggleComplete = async (item: Task) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/events?id=${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_completed: !item.is_completed, type: "task", name: item.name }),
      });
      if (response.ok) {
        const updatedTask = await response.json();
        setTasks((prev) => prev.map((task) => (task.id === item.id ? updatedTask : task)));
        setNotification({
          message: `Task "${updatedTask.name}" marked as ${updatedTask.is_completed ? "completed" : "not completed"}.`,
          type: updatedTask.is_completed ? "success" : "error",
        });
      } else {
        console.error("Failed to update task completion status:", await response.json());
        setNotification({ message: "Failed to update task completion status.", type: "error" });
      }
    } catch (error) {
      console.error("Error updating task completion status:", error);
      setNotification({ message: "An error occurred while updating task completion status.", type: "error" });
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
        if (statusFilter === "Not Completed" && task.is_completed) {
          return false;
        }
      }
      if (tagFilter === "All") return true;
      if (!task.tags) return false;
      return task.tags.includes(tagFilter);
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

  return {
    tasks,
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
    handleAddTaskCard,
    collectUniqueTags,
    handleFormChange,
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
