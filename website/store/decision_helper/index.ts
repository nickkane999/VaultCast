import { createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { fetchCalendarEvents } from "./eventsSlice";
import { fetchTasks } from "./tasksSlice";
import { fetchProjects } from "./projectsSlice";
import { fetchCommonDecisions } from "./commonDecisionsSlice";
import { fetchEssentials } from "./essentialsSlice";

// Main thunk to fetch all decision helper data
export const fetchAllDecisionHelperData = createAsyncThunk<
  void,
  void,
  {
    state: RootState;
    rejectValue: string;
  }
>("decisionHelper/fetchAllData", async (_, { dispatch, rejectWithValue }) => {
  try {
    await Promise.all([dispatch(fetchCalendarEvents()), dispatch(fetchCommonDecisions()), dispatch(fetchTasks()), dispatch(fetchProjects()), dispatch(fetchEssentials())]);
  } catch (error: any) {
    console.error("Error fetching all decision helper data:", error);
    return rejectWithValue(error.message || "Failed to fetch data");
  }
});

// Re-export all the slices and their actions
export { default as eventsReducer } from "./eventsSlice";
export { default as tasksReducer } from "./tasksSlice";
export { default as projectsReducer } from "./projectsSlice";
export { default as commonDecisionsReducer } from "./commonDecisionsSlice";
export { default as essentialsReducer } from "./essentialsSlice";

// Re-export types
export type { EventsState, EventFormState } from "./eventsSlice";
export type { TasksState, TaskFormState } from "./tasksSlice";
export type { ProjectsState, ProjectFormState } from "./projectsSlice";
export type { CommonDecisionsState } from "./commonDecisionsSlice";
export type { EssentialsState, Essential } from "./essentialsSlice";

// Re-export actions for easy import
export * from "./eventsSlice";
export * from "./tasksSlice";
export * from "./projectsSlice";
export * from "./commonDecisionsSlice";
export * from "./essentialsSlice";
