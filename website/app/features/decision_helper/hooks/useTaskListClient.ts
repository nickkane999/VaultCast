import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store/store";
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
  setStatusFilter,
  setAddTagInputValue,
  setNewTagInput,
  setTaskNotification,
  setProjectFilter,
  createTask,
  updateTaskThunk,
  deleteTaskThunk,
} from "../../../../store/decisionHelperSlice";
import { Task, Event, CommonDecision } from "../types";
import React from "react";

interface UseTaskListClientProps {
  initialTasks: Task[];
  initialProjects: any[];
}

export const useTaskListClient = ({ initialTasks, initialProjects }: UseTaskListClientProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, projects, taskShowForm, newTask, editingTaskId, editedTask, editedTaskTags, taskDecisions, tagFilter, statusFilter, availableTags, addTagInputValue, newTagInput, taskNotification, projectFilter, loading } = useSelector((state: RootState) => state.decisionHelper);

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
      dispatch(
        updateTaskThunk({
          id: item.id,
          taskData: { name: item.name, is_completed: !item.is_completed },
        })
      );
    }
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
    setShowForm: (value: boolean) => dispatch(setTaskShowForm(value)),
    setNewTask: (task: any) => dispatch(setNewTask(task)),
    setEditingId: (id: string | number | null) => dispatch(setEditingTaskId(id)),
    setEditedTask: (task: Task | null) => dispatch(setEditedTask(task)),
    setTagFilter: (filter: string) => dispatch(setTagFilter(filter)),
    setStatusFilter: (filter: "All" | "Completed" | "Not Completed") => dispatch(setStatusFilter(filter)),
    setEditedTaskTags: (tags: string[]) => dispatch(setEditedTaskTags(tags)),
    setAddTagInputValue: (value: string) => dispatch(setAddTagInputValue(value)),
    setNewTagInput: (value: string) => dispatch(setNewTagInput(value)),
    setNotification: (notification: any) => dispatch(setTaskNotification(notification)),
  };
};
