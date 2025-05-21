import { useState, useEffect } from "react";
import { Project } from "../types";

interface UseProjectListStateProps {
  initialProjects: Project[];
}

export function useProjectListState({ initialProjects }: UseProjectListStateProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [showForm, setShowForm] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "", dueDate: "" });
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editedProject, setEditedProject] = useState({ name: "", description: "", dueDate: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  const handleAddCard = () => setShowForm(true);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewProject({ ...newProject, [e.target.name]: e.target.value });
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditedProject({ ...editedProject, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name || !newProject.description || !newProject.dueDate) return;
    setLoading(true);
    try {
      const response = await fetch("/api/decision_helper/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      });
      if (response.ok) {
        const addedProject = await response.json();
        setProjects((prev) => [...prev, addedProject]);
        setNewProject({ name: "", description: "", dueDate: "" });
        setShowForm(false);
      } else {
        const errorData = await response.json();
        console.error("Failed to add project:", errorData);
        alert(`Error: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error adding project:", error);
      alert("An unexpected error occurred. Please try again.");
    }
    setLoading(false);
  };

  const handleEditFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedProject.name || !editedProject.description || !editedProject.dueDate || editingId === null) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/decision_helper/projects?id=${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedProject),
      });
      if (response.ok) {
        const updatedProject = await response.json();

        // First clear the editing state
        setEditingId(null);
        setEditedProject({ name: "", description: "", dueDate: "" });

        // Then update the projects array
        setProjects((prev) => {
          const newState = prev.map((project) =>
            project.id === updatedProject.id
              ? { ...updatedProject, type: "project" } // Ensure type field is included
              : project
          );
          console.log("Projects state after update:", newState);
          return newState;
        });
      } else {
        const errorData = await response.json();
        console.error("Failed to update project:", errorData);
        alert(`Error: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error updating project:", error);
      alert("An unexpected error occurred. Please try again.");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string | number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/decision_helper/projects?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setProjects((prev) => prev.filter((project) => project.id !== id));
      } else {
        const errorData = await response.json();
        console.error("Failed to delete project:", errorData);
        alert(`Error: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("An unexpected error occurred. Please try again.");
    }
    setLoading(false);
  };

  const handleEdit = (project: Project) => {
    setEditingId(project.id);
    setEditedProject({ name: project.name, description: project.description, dueDate: project.dueDate });
  };

  return {
    projects,
    showForm,
    newProject,
    editingId,
    editedProject,
    loading,
    handleAddCard,
    handleFormChange,
    handleEditFormChange,
    handleFormSubmit,
    handleEditFormSubmit,
    handleDelete,
    handleEdit,
    setShowForm,
    setEditingId,
  };
}
