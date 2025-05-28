import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { useMemo } from "react";
import {
  setTaskShowForm,
  setNewTask,
  updateNewTask,
  setEditingTaskId,
  setEditedTask,
  updateEditedTask,
  setEditedTaskTags,
  setTaskDecision,
  setTagFilter,
  setTaskStatusFilter,
  setAddTagInputValue,
  setNewTagInput,
  setTaskNotification,
  setProjectFilter,
  setTaskCompletionDialogOpen,
  setTaskCompletionDescription,
  setCompletingTaskId,
  createTask,
  updateTaskThunk,
  deleteTaskThunk,
} from "@/store/decision_helper";
import { Task, Event, CommonDecision } from "../types";
import React from "react";

interface UseTaskListClientProps {
  initialTasks: Task[];
  initialProjects: any[];
}

export const useTaskListClient = ({ initialTasks, initialProjects }: UseTaskListClientProps) => {
  const dispatch = useDispatch<AppDispatch>();

  // Memoized selectors for specific state pieces to prevent unnecessary re-renders
  const tasks = useSelector((state: RootState) => state.decisionHelper.tasks.tasks);
  const taskShowForm = useSelector((state: RootState) => state.decisionHelper.tasks.taskShowForm);
  const newTask = useSelector((state: RootState) => state.decisionHelper.tasks.newTask);
  const editingTaskId = useSelector((state: RootState) => state.decisionHelper.tasks.editingTaskId);
  const editedTask = useSelector((state: RootState) => state.decisionHelper.tasks.editedTask);
  const editedTaskTags = useSelector((state: RootState) => state.decisionHelper.tasks.editedTaskTags);
  const taskDecisions = useSelector((state: RootState) => state.decisionHelper.tasks.taskDecisions);
  const tagFilter = useSelector((state: RootState) => state.decisionHelper.tasks.tagFilter);
  const statusFilter = useSelector((state: RootState) => state.decisionHelper.tasks.statusFilter);
  const availableTags = useSelector((state: RootState) => state.decisionHelper.tasks.availableTags);
  const addTagInputValue = useSelector((state: RootState) => state.decisionHelper.tasks.addTagInputValue);
  const newTagInput = useSelector((state: RootState) => state.decisionHelper.tasks.newTagInput);
  const taskNotification = useSelector((state: RootState) => state.decisionHelper.tasks.taskNotification);
  const projectFilter = useSelector((state: RootState) => state.decisionHelper.tasks.projectFilter);
  const loading = useSelector((state: RootState) => state.decisionHelper.tasks.loading);
  const completionDialogOpen = useSelector((state: RootState) => state.decisionHelper.tasks.completionDialogOpen);
  const completionDescription = useSelector((state: RootState) => state.decisionHelper.tasks.completionDescription);
  const completingTaskId = useSelector((state: RootState) => state.decisionHelper.tasks.completingTaskId);

  const projects = useSelector((state: RootState) => state.decisionHelper.projects.projects);

  const handleAddTaskCard = () => {
    dispatch(setNewTask({ name: "", is_completed: false, tags: [], projectId: undefined }));
    dispatch(setAddTagInputValue(""));
    dispatch(setNewTagInput(""));
    dispatch(setTaskShowForm(true));
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (name !== "tags") {
      dispatch(updateNewTask({ [name]: type === "checkbox" ? checked : value }));
    }
  };

  // Debounced handler for isolated text fields
  const handleDebouncedFormChange = (name: string) => (value: string) => {
    dispatch(updateNewTask({ [name]: value }));
  };

  const handleProjectChange = (projectId: string | undefined) => {
    dispatch(updateNewTask({ projectId }));
  };

  const handleEditProjectChange = (projectId: string | undefined) => {
    if (editedTask) {
      dispatch(updateEditedTask({ projectId }));
    }
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (name !== "tags") {
      dispatch(updateEditedTask({ [name]: type === "checkbox" ? checked : value }));
    }
  };

  // Debounced handler for isolated text fields in edit mode
  const handleDebouncedEditFormChange = (name: string) => (value: string) => {
    dispatch(updateEditedTask({ [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.name) return;

    dispatch(
      createTask({
        name: newTask.name,
        is_completed: newTask.is_completed,
        tags: newTask.tags,
        projectId: newTask.projectId,
      })
    );
  };

  const handleEditFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedTask || !editedTask.name || editingTaskId === null) return;

    dispatch(
      updateTaskThunk({
        id: editingTaskId,
        taskData: {
          name: editedTask.name,
          is_completed: editedTask.is_completed,
          tags: editedTaskTags,
          projectId: editedTask.projectId,
        },
      })
    );
  };

  const handleDelete = async (id: string | number) => {
    dispatch(deleteTaskThunk(id));
  };

  const handleEdit = (item: Event | CommonDecision | Task) => {
    dispatch(setEditingTaskId(item.id));
    dispatch(setEditedTask(item as Task));
    dispatch(setEditedTaskTags((item as Task).tags || []));
  };

  const handleToggleComplete = async (item: Task) => {
    if (item.id) {
      if (!item.is_completed) {
        dispatch(setCompletingTaskId(item.id.toString()));
        dispatch(setTaskCompletionDescription(""));
        dispatch(setTaskCompletionDialogOpen(true));
      } else {
        dispatch(
          updateTaskThunk({
            id: item.id,
            taskData: { name: item.name, is_completed: false, complete_description: "" },
          })
        );
      }
    }
  };

  const handleCompletionSave = async (description: string) => {
    if (completingTaskId) {
      const task = tasks.find((t) => t.id.toString() === completingTaskId);
      if (task) {
        dispatch(
          updateTaskThunk({
            id: completingTaskId,
            taskData: {
              name: task.name,
              is_completed: true,
              complete_description: description,
            },
          })
        );
      }
      dispatch(setTaskCompletionDialogOpen(false));
      dispatch(setCompletingTaskId(null));
      dispatch(setTaskCompletionDescription(""));
    }
  };

  const handleCompletionCancel = () => {
    dispatch(setTaskCompletionDialogOpen(false));
    dispatch(setCompletingTaskId(null));
    dispatch(setTaskCompletionDescription(""));
  };

  const handleDecision = (id: string | number) => {
    const randomNum = Math.floor(Math.random() * 100) + 1;
    dispatch(setTaskDecision({ id: id.toString(), value: randomNum }));
  };

  const getFilteredAndSortedTasks = () => {
    return tasks.filter((task) => {
      if (statusFilter !== "All") {
        if (statusFilter === "Completed" && !task.is_completed) {
          return false;
        }
        if (statusFilter === "Not Completed" && task.is_completed) {
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
      return true;
    });
  };

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    dispatch(updateNewTask({ tags: [...newTask.tags, newTagInput.trim()] }));
    dispatch(setNewTagInput(""));
    dispatch(setAddTagInputValue(""));
  };

  const handleTagChange = (_event: any, newValue: string[]) => {
    // Handled by Autocomplete directly
  };

  const handleProjectFilterChange = (projectId: string | "All") => {
    dispatch(setProjectFilter(projectId));
  };

  const displayedTasks = getFilteredAndSortedTasks();

  return {
    tasks,
    projects,
    showForm: taskShowForm,
    newTask,
    editingId: editingTaskId,
    editedTask,
    loading,
    taskDecisions,
    tagFilter,
    statusFilter,
    availableTags,
    editedTaskTags,
    addTagInputValue,
    newTagInput,
    notification: taskNotification,
    projectFilter,
    completionDialogOpen,
    completionDescription,
    completingTaskId,
    handleAddTaskCard,
    handleFormChange,
    handleDebouncedFormChange,
    handleProjectChange,
    handleEditProjectChange,
    handleEditFormChange,
    handleDebouncedEditFormChange,
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
    handleCompletionSave,
    handleCompletionCancel,
    setShowForm: (value: boolean) => dispatch(setTaskShowForm(value)),
    setNewTask: (task: { name: string; is_completed: boolean; tags: string[]; projectId?: string | undefined }) => dispatch(setNewTask(task)),
    setEditingId: (id: string | number | null) => dispatch(setEditingTaskId(id)),
    setEditedTask: (task: Task | null) => dispatch(setEditedTask(task)),
    setTagFilter: (filter: string) => dispatch(setTagFilter(filter)),
    setStatusFilter: (filter: "All" | "Completed" | "Not Completed") => dispatch(setTaskStatusFilter(filter)),
    setEditedTaskTags: (tags: string[]) => dispatch(setEditedTaskTags(tags)),
    setAddTagInputValue: (value: string) => dispatch(setAddTagInputValue(value)),
    setNewTagInput: (value: string) => dispatch(setNewTagInput(value)),
    setNotification: (notification: { message: string; type: "success" | "error" | null } | null) => dispatch(setTaskNotification(notification)),
    setCompletionDescription: (description: string) => dispatch(setTaskCompletionDescription(description)),
  };
};
