// Legacy file - functionality has been moved to individual slice files
// This file is kept for backward compatibility and to re-export everything

import { combineReducers } from "@reduxjs/toolkit";
import eventsReducer from "./eventsSlice";
import tasksReducer from "./tasksSlice";
import projectsReducer from "./projectsSlice";
import commonDecisionsReducer from "./commonDecisionsSlice";
import essentialsReducer from "./essentialsSlice";

// Combined decisionHelper reducer
const decisionHelperReducer = combineReducers({
  events: eventsReducer,
  tasks: tasksReducer,
  projects: projectsReducer,
  commonDecisions: commonDecisionsReducer,
  essentials: essentialsReducer,
});

// Re-export specific actions to avoid naming conflicts
export { fetchCalendarEvents, createEvent, updateEventThunk, deleteEventThunk, setEventShowForm, setNewEvent, updateNewEvent, setEditingEventId, setEditedEvent, updateEditedEvent, setEventDecision, setDateFilter, setSortOrder, setHidePastDates, setCalendarEvents } from "./eventsSlice";
export {
  fetchTasks,
  createTask,
  updateTaskThunk,
  deleteTaskThunk,
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
  setTasks,
} from "./tasksSlice";
export {
  fetchProjects,
  createProject,
  updateProjectThunk,
  deleteProjectThunk,
  setProjectShowForm,
  setNewProject,
  updateNewProject,
  setEditingProjectId,
  setEditedProject,
  updateEditedProject,
  setProjectStatusFilter,
  setSortOrder as setProjectSortOrder,
  setHidePastDates as setProjectHidePastDates,
  setProjectCompletionDialogOpen,
  setProjectCompletionDescription,
  setCompletingProjectId,
  setProjects,
} from "./projectsSlice";
export { fetchCommonDecisions, createDecision, updateDecisionThunk, deleteDecisionThunk, setDecisionShowForm, setNewDecision, updateNewDecision, setEditingDecisionId, setEditedDecision, updateEditedDecision, setCommonDecisionResult, setCommonDecisions } from "./commonDecisionsSlice";
export { fetchEssentials, createEssential, completeEssential, updateEssential, deleteEssential, setShowForm, setNewEssential, updateNewEssential, setEditingEssentialId, setEditedEssential, updateEditedEssential, setEssentialDecision, setEssentials } from "./essentialsSlice";

// Re-export the main fetch function
export { fetchAllDecisionHelperData } from "./index";

export default decisionHelperReducer;

// Export the combined state type
export type DecisionHelperState = ReturnType<typeof decisionHelperReducer>;
