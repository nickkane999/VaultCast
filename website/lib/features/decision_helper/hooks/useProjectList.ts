import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  setProjectShowForm,
  setNewProject,
  updateNewProject,
  setEditingProjectId,
  setEditedProject,
  updateEditedProject,
  createProject,
  updateProjectThunk,
  deleteProjectThunk,
  setProjectStatusFilter,
  setProjectSortOrder,
  setProjectHidePastDates,
  setProjectCompletionDialogOpen,
  setProjectCompletionDescription,
  setCompletingProjectId,
} from "@/store/decision_helper";
import { Project } from "../types";
import { useEffect } from "react";

interface UseProjectListProps {
  initialProjects: Project[];
}

export const useProjectList = ({ initialProjects }: UseProjectListProps) => {
  const dispatch = useDispatch<AppDispatch>();

  // Memoized selectors for specific state pieces to prevent unnecessary re-renders
  const projects = useSelector((state: RootState) => state.decisionHelper.projects.projects);
  const projectShowForm = useSelector((state: RootState) => state.decisionHelper.projects.projectShowForm);
  const newProject = useSelector((state: RootState) => state.decisionHelper.projects.newProject);
  const editingProjectId = useSelector((state: RootState) => state.decisionHelper.projects.editingProjectId);
  const editedProject = useSelector((state: RootState) => state.decisionHelper.projects.editedProject);
  const loading = useSelector((state: RootState) => state.decisionHelper.projects.loading);
  const statusFilter = useSelector((state: RootState) => state.decisionHelper.projects.statusFilter);
  const sortOrder = useSelector((state: RootState) => state.decisionHelper.projects.sortOrder);
  const hidePastDates = useSelector((state: RootState) => state.decisionHelper.projects.hidePastDates);
  const completionDialogOpen = useSelector((state: RootState) => state.decisionHelper.projects.completionDialogOpen);
  const completionDescription = useSelector((state: RootState) => state.decisionHelper.projects.completionDescription);
  const completingProjectId = useSelector((state: RootState) => state.decisionHelper.projects.completingProjectId);

  const getFilteredProjects = () => {
    let filteredProjects = projects.length > 0 ? [...projects] : [...initialProjects];

    // Apply status filter
    if (statusFilter !== "All") {
      filteredProjects = filteredProjects.filter((project) => {
        if (statusFilter === "Completed") return project.is_completed;
        if (statusFilter === "Not Completed") return !project.is_completed;
        return true;
      });
    }

    // Apply hide past dates filter
    if (hidePastDates) {
      const now = new Date();
      now.setHours(23, 59, 59, 999);
      filteredProjects = filteredProjects.filter((project) => {
        if (!project.dueDate) return true;
        const dueDate = new Date(project.dueDate);
        dueDate.setHours(23, 59, 59, 999);
        return dueDate >= now;
      });
    }

    // Apply sort order
    filteredProjects.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;

      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();

      return sortOrder === "Ascending" ? dateA - dateB : dateB - dateA;
    });

    return filteredProjects;
  };

  const displayedProjects = getFilteredProjects();

  const handleAddCard = () => {
    dispatch(setNewProject({ name: "", description: "", dueDate: "", is_completed: false }));
    dispatch(setProjectShowForm(true));
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    if (type === "checkbox") {
      dispatch(updateNewProject({ [name]: checked }));
    } else {
      dispatch(updateNewProject({ [name]: value }));
    }
  };

  // Debounced handler for isolated text fields
  const handleDebouncedFormChange = (name: string) => (value: string) => {
    dispatch(updateNewProject({ [name]: value }));
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    if (type === "checkbox") {
      dispatch(updateEditedProject({ [name]: checked }));
    } else {
      dispatch(updateEditedProject({ [name]: value }));
    }
  };

  // Debounced handler for isolated text fields in edit mode
  const handleDebouncedEditFormChange = (name: string) => (value: string) => {
    dispatch(updateEditedProject({ [name]: value }));
  };

  const handleToggleComplete = (project: Project) => {
    if (!project.is_completed) {
      dispatch(setCompletingProjectId(project.id.toString()));
      dispatch(setProjectCompletionDescription(""));
      dispatch(setProjectCompletionDialogOpen(true));
    } else {
      dispatch(
        updateProjectThunk({
          id: project.id,
          projectData: {
            name: project.name,
            description: project.description,
            dueDate: project.dueDate,
            is_completed: false,
            complete_description: "",
          },
        })
      );
    }
  };

  const handleCompletionSave = async (description: string) => {
    if (completingProjectId) {
      const project = projects.find((p) => p.id.toString() === completingProjectId);
      if (project) {
        dispatch(
          updateProjectThunk({
            id: completingProjectId,
            projectData: {
              name: project.name,
              description: project.description,
              dueDate: project.dueDate,
              is_completed: true,
              complete_description: description,
            },
          })
        );
      }
      dispatch(setProjectCompletionDialogOpen(false));
      dispatch(setCompletingProjectId(null));
      dispatch(setProjectCompletionDescription(""));
    }
  };

  const handleCompletionCancel = () => {
    dispatch(setProjectCompletionDialogOpen(false));
    dispatch(setCompletingProjectId(null));
    dispatch(setProjectCompletionDescription(""));
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
        is_completed: project.is_completed,
      })
    );
  };

  return {
    projects: displayedProjects,
    showForm: projectShowForm,
    newProject,
    editingId: editingProjectId,
    editedProject,
    loading,
    statusFilter,
    sortOrder,
    hidePastDates,
    completionDialogOpen,
    completionDescription,
    completingProjectId,
    handleAddCard,
    handleFormChange,
    handleDebouncedFormChange,
    handleEditFormChange,
    handleDebouncedEditFormChange,
    handleFormSubmit,
    handleEditFormSubmit,
    handleDelete,
    handleEdit,
    handleToggleComplete,
    handleCompletionSave,
    handleCompletionCancel,
    setShowForm: (show: boolean) => dispatch(setProjectShowForm(show)),
    setEditingId: (id: string | number | null) => dispatch(setEditingProjectId(id)),
    setStatusFilter: (filter: "All" | "Completed" | "Not Completed") => dispatch(setProjectStatusFilter(filter)),
    setSortOrder: (order: "Ascending" | "Descending") => dispatch(setProjectSortOrder(order)),
    setHidePastDates: (hide: boolean) => dispatch(setProjectHidePastDates(hide)),
    setCompletionDescription: (description: string) => dispatch(setProjectCompletionDescription(description)),
  };
};
