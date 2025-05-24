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

// Re-export all actions and types from the individual slices for easy access
export * from "./eventsSlice";
export * from "./tasksSlice";
export * from "./projectsSlice";
export * from "./commonDecisionsSlice";
export * from "./essentialsSlice";

// Re-export the main fetch function
export { fetchAllDecisionHelperData } from "./index";

export default decisionHelperReducer;

// Export the combined state type
export type DecisionHelperState = ReturnType<typeof decisionHelperReducer>;
