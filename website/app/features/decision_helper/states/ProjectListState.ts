import { useState, useEffect } from "react";
import { Project } from "../types";
import { addProject, updateProject, deleteProject } from "../queries/project_queries";

interface UseProjectListStateProps {
  initialProjects: Project[];
}

export function useProjectListState({ initialProjects }: UseProjectListStateProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [showForm, setShowForm] = useState(false);
  const [newProject, setNewProject] = useState<Omit<Project, "id">>({ name: "", description: "", dueDate: "" });
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editedProject, setEditedProject] = useState<Omit<Project, "id" | "type"> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  const handleAddCard = () => {
    setNewProject({ name: "", description: "", dueDate: "" });
    setShowForm(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProject({ ...newProject, [name]: value });
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedProject((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name || !newProject.description || !newProject.dueDate) return;
    setLoading(true);
    try {
      const addedProject = await addProject(newProject);
      setProjects((prev) => [...prev, addedProject]);
      setNewProject({ name: "", description: "", dueDate: "" });
      setShowForm(false);
    } catch (error: any) {
      console.error("Error adding project:", error);
      alert(`Error: ${error.message || "Unknown error"}`);
    }
    setLoading(false);
  };

  const handleEditFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedProject?.name || !editedProject.description || !editedProject.dueDate || editingId === null) return;
    setLoading(true);
    try {
      const updatedProject = await updateProject(editingId, editedProject);
      // First clear the editing state
      setEditingId(null);
      setEditedProject(null);

      // Then update the projects array
      setProjects((prev) => {
        const newState = prev.map((project) => (project.id === updatedProject.id ? { ...updatedProject } : project));
        console.log("Projects state after update:", newState);
        return newState;
      });
    } catch (error: any) {
      console.error("Error updating project:", error);
      alert(`Error: ${error.message || "Unknown error"}`);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string | number) => {
    setLoading(true);
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((project) => project.id !== id));
    } catch (error: any) {
      console.error("Error deleting project:", error);
      alert(`Error: ${error.message || "Unknown error"}`);
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
