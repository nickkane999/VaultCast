import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { setProjectShowForm, setNewProject, updateNewProject, setEditingProjectId, setEditedProject, updateEditedProject, createProject, updateProjectThunk, deleteProjectThunk } from "@/store/decision_helper";
import { Project } from "../types";
import { useEffect } from "react";
interface UseProjectListProps {
  initialProjects: Project[];
}
export const useProjectList = ({ initialProjects }: UseProjectListProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { projects, projectShowForm, newProject, editingProjectId, editedProject, loading } = useSelector((state: RootState) => state.decisionHelper.projects);

  const handleAddCard = () => {
    dispatch(setNewProject({ name: "", description: "", dueDate: "" }));
    dispatch(setProjectShowForm(true));
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    dispatch(updateNewProject({ [name]: value }));
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    dispatch(updateEditedProject({ [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name || !newProject.description || !newProject.dueDate) return;

    dispatch(createProject(newProject));
  };

  const handleEditFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedProject?.name || !editedProject.description || !editedProject.dueDate || editingProjectId === null) return;

    dispatch(
      updateProjectThunk({
        id: editingProjectId,
        projectData: editedProject,
      })
    );
  };

  const handleDelete = async (id: string | number) => {
    dispatch(deleteProjectThunk(id));
  };

  const handleEdit = (project: Project) => {
    dispatch(setEditingProjectId(project.id));
    dispatch(
      setEditedProject({
        name: project.name,
        description: project.description,
        dueDate: project.dueDate,
      })
    );
  };

  return {
    projects,
    showForm: projectShowForm,
    newProject,
    editingId: editingProjectId,
    editedProject,
    loading,
    handleAddCard,
    handleFormChange,
    handleEditFormChange,
    handleFormSubmit,
    handleEditFormSubmit,
    handleDelete,
    handleEdit,
    setShowForm: (show: boolean) => dispatch(setProjectShowForm(show)),
    setEditingId: (id: string | number | null) => dispatch(setEditingProjectId(id)),
  };
};
