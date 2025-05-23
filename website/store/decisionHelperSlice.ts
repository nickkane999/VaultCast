import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "./store";
import { Event, Task, CommonDecision, Project } from "../app/features/decision_helper/types";
import { addTask, updateTask, deleteTask } from "../app/features/decision_helper/queries/task_queries";
import { addEvent, updateEvent, deleteEvent } from "../app/features/decision_helper/queries/event_queries";
import { addProject, updateProject, deleteProject } from "../app/features/decision_helper/queries/project_queries";
import { addDecision, updateDecision, deleteDecision } from "../app/features/decision_helper/queries/decision_queries";

interface TaskFormState {
  name: string;
  is_completed: boolean;
  tags: string[];
  projectId?: string | undefined;
}

interface EventFormState {
  name: string;
  date: string;
  startTime?: string;
  endTime?: string;
  attended?: boolean;
}

interface ProjectFormState {
  name: string;
  description: string;
  dueDate: string;
}

interface DecisionHelperState {
  calendarEvents: Event[];
  commonDecisions: CommonDecision[];
  tasks: Task[];
  projects: Project[];
  loading: boolean;
  error: string | null;
  tabValue: number;

  // Task management state
  taskShowForm: boolean;
  newTask: TaskFormState;
  editingTaskId: string | number | null;
  editedTask: Task | null;
  editedTaskTags: string[];
  taskDecisions: Record<string, number>;
  tagFilter: string;
  statusFilter: "All" | "Completed" | "Not Completed";
  availableTags: string[];
  addTagInputValue: string;
  newTagInput: string;
  taskNotification: { message: string; type: "success" | "error" | null } | null;
  projectFilter: string | "All";

  // Event management state
  eventShowForm: boolean;
  newEvent: EventFormState;
  editingEventId: string | number | null;
  editedEvent: Event | null;
  eventDecisions: Record<string, number>;
  dateFilter: string;
  sortOrder: "Ascending" | "Descending";
  hidePastDates: boolean;

  // Project management state
  projectShowForm: boolean;
  newProject: Omit<Project, "id">;
  editingProjectId: string | number | null;
  editedProject: Omit<Project, "id" | "type"> | null;

  // Common decisions management state
  decisionShowForm: boolean;
  newDecision: { name: string };
  editingDecisionId: string | number | null;
  editedDecision: { name: string };
  commonDecisionResults: Record<string, number>;
}

const initialState: DecisionHelperState = {
  calendarEvents: [],
  commonDecisions: [],
  tasks: [],
  projects: [],
  loading: false,
  error: null,
  tabValue: 0,

  // Task management initial state
  taskShowForm: false,
  newTask: { name: "", is_completed: false, tags: [], projectId: undefined },
  editingTaskId: null,
  editedTask: null,
  editedTaskTags: [],
  taskDecisions: {},
  tagFilter: "All",
  statusFilter: "Not Completed",
  availableTags: [],
  addTagInputValue: "",
  newTagInput: "",
  taskNotification: null,
  projectFilter: "All",

  // Event management initial state
  eventShowForm: false,
  newEvent: { name: "", date: "", startTime: "", endTime: "", attended: false },
  editingEventId: null,
  editedEvent: null,
  eventDecisions: {},
  dateFilter: "All",
  sortOrder: "Descending",
  hidePastDates: true,

  // Project management initial state
  projectShowForm: false,
  newProject: { name: "", description: "", dueDate: "" },
  editingProjectId: null,
  editedProject: null,

  // Common decisions initial state
  decisionShowForm: false,
  newDecision: { name: "" },
  editingDecisionId: null,
  editedDecision: { name: "" },
  commonDecisionResults: {},
};

// Async Thunks for fetching data
export const fetchCalendarEvents = createAsyncThunk<
  Event[],
  void,
  {
    state: RootState;
    rejectValue: string;
  }
>("decisionHelper/fetchCalendarEvents", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/decision_helper/events");
    if (!response.ok) {
      const errorText = await response.text();
      return rejectWithValue(errorText || "Failed to fetch calendar events");
    }
    const data = await response.json();
    return data as Event[];
  } catch (error: any) {
    console.error("Error fetching calendar events:", error);
    return rejectWithValue(error.message || "Failed to fetch calendar events");
  }
});

export const fetchCommonDecisions = createAsyncThunk<
  CommonDecision[],
  void,
  {
    state: RootState;
    rejectValue: string;
  }
>("decisionHelper/fetchCommonDecisions", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/decision_helper/decisions");
    if (!response.ok) {
      const errorText = await response.text();
      return rejectWithValue(errorText || "Failed to fetch common decisions");
    }
    const data = await response.json();
    const transformedData = data.map((item: any) => ({
      id: item.id,
      name: item.name,
      type: "common_decision",
    }));
    return transformedData as CommonDecision[];
  } catch (error: any) {
    console.error("Error fetching common decisions:", error);
    return rejectWithValue(error.message || "Failed to fetch common decisions");
  }
});

export const fetchTasks = createAsyncThunk<
  Task[],
  void,
  {
    state: RootState;
    rejectValue: string;
  }
>("decisionHelper/fetchTasks", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/decision_helper/tasks");
    if (!response.ok) {
      const errorText = await response.text();
      return rejectWithValue(errorText || "Failed to fetch tasks");
    }
    const data = await response.json();
    const transformedData = data.map((item: any) => ({ ...item, type: "task" }));
    return transformedData as Task[];
  } catch (error: any) {
    console.error("Error fetching tasks:", error);
    return rejectWithValue(error.message || "Failed to fetch tasks");
  }
});

export const fetchProjects = createAsyncThunk<
  Project[],
  void,
  {
    state: RootState;
    rejectValue: string;
  }
>("decisionHelper/fetchProjects", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/decision_helper/projects");
    if (!response.ok) {
      const errorText = await response.text();
      return rejectWithValue(errorText || "Failed to fetch projects");
    }
    const data = await response.json();
    const transformedData = data.map((item: any) => ({ ...item, type: "project" }));
    return transformedData as Project[];
  } catch (error: any) {
    console.error("Error fetching projects:", error);
    return rejectWithValue(error.message || "Failed to fetch projects");
  }
});

// Task management thunks
export const createTask = createAsyncThunk<
  Task,
  Omit<Task, "id">,
  {
    state: RootState;
    rejectValue: string;
  }
>("decisionHelper/createTask", async (taskData, { rejectWithValue }) => {
  try {
    const addedTask = await addTask(taskData);
    return addedTask;
  } catch (error: any) {
    console.error("Error creating task:", error);
    return rejectWithValue(error.message || "Failed to create task");
  }
});

export const updateTaskThunk = createAsyncThunk<
  Task,
  { id: string | number; taskData: Partial<Task> },
  {
    state: RootState;
    rejectValue: string;
  }
>("decisionHelper/updateTask", async ({ id, taskData }, { rejectWithValue }) => {
  try {
    const updatedTask = await updateTask(id, taskData);
    return updatedTask;
  } catch (error: any) {
    console.error("Error updating task:", error);
    return rejectWithValue(error.message || "Failed to update task");
  }
});

export const deleteTaskThunk = createAsyncThunk<
  string | number,
  string | number,
  {
    state: RootState;
    rejectValue: string;
  }
>("decisionHelper/deleteTask", async (id, { rejectWithValue }) => {
  try {
    await deleteTask(id);
    return id;
  } catch (error: any) {
    console.error("Error deleting task:", error);
    return rejectWithValue(error.message || "Failed to delete task");
  }
});

// Event management thunks
export const createEvent = createAsyncThunk<
  Event,
  Omit<Event, "id">,
  {
    state: RootState;
    rejectValue: string;
  }
>("decisionHelper/createEvent", async (eventData, { rejectWithValue }) => {
  try {
    const addedEvent = await addEvent(eventData);
    return addedEvent;
  } catch (error: any) {
    console.error("Error creating event:", error);
    return rejectWithValue(error.message || "Failed to create event");
  }
});

export const updateEventThunk = createAsyncThunk<
  Event,
  Event,
  {
    state: RootState;
    rejectValue: string;
  }
>("decisionHelper/updateEvent", async (eventData, { rejectWithValue }) => {
  try {
    const updatedEvent = await updateEvent(eventData);
    return updatedEvent;
  } catch (error: any) {
    console.error("Error updating event:", error);
    return rejectWithValue(error.message || "Failed to update event");
  }
});

export const deleteEventThunk = createAsyncThunk<
  string | number,
  string | number,
  {
    state: RootState;
    rejectValue: string;
  }
>("decisionHelper/deleteEvent", async (id, { rejectWithValue }) => {
  try {
    await deleteEvent(id);
    return id;
  } catch (error: any) {
    console.error("Error deleting event:", error);
    return rejectWithValue(error.message || "Failed to delete event");
  }
});

// Project management thunks
export const createProject = createAsyncThunk<
  Project,
  Omit<Project, "id">,
  {
    state: RootState;
    rejectValue: string;
  }
>("decisionHelper/createProject", async (projectData, { rejectWithValue }) => {
  try {
    const addedProject = await addProject(projectData);
    return addedProject;
  } catch (error: any) {
    console.error("Error creating project:", error);
    return rejectWithValue(error.message || "Failed to create project");
  }
});

export const updateProjectThunk = createAsyncThunk<
  Project,
  { id: string | number; projectData: Omit<Project, "id" | "type"> },
  {
    state: RootState;
    rejectValue: string;
  }
>("decisionHelper/updateProject", async ({ id, projectData }, { rejectWithValue }) => {
  try {
    const updatedProject = await updateProject(id, projectData);
    return updatedProject;
  } catch (error: any) {
    console.error("Error updating project:", error);
    return rejectWithValue(error.message || "Failed to update project");
  }
});

export const deleteProjectThunk = createAsyncThunk<
  string | number,
  string | number,
  {
    state: RootState;
    rejectValue: string;
  }
>("decisionHelper/deleteProject", async (id, { rejectWithValue }) => {
  try {
    await deleteProject(id);
    return id;
  } catch (error: any) {
    console.error("Error deleting project:", error);
    return rejectWithValue(error.message || "Failed to delete project");
  }
});

// Common decision management thunks
export const createDecision = createAsyncThunk<
  CommonDecision,
  string,
  {
    state: RootState;
    rejectValue: string;
  }
>("decisionHelper/createDecision", async (name, { rejectWithValue }) => {
  try {
    const addedDecision = await addDecision(name);
    return { id: addedDecision.id, name: addedDecision.name, type: "common_decision" };
  } catch (error: any) {
    console.error("Error creating decision:", error);
    return rejectWithValue(error.message || "Failed to create decision");
  }
});

export const updateDecisionThunk = createAsyncThunk<
  CommonDecision,
  { id: string | number; name: string },
  {
    state: RootState;
    rejectValue: string;
  }
>("decisionHelper/updateDecision", async ({ id, name }, { rejectWithValue }) => {
  try {
    const updatedDecision = await updateDecision(id, name);
    return { id, name: updatedDecision.name, type: "common_decision" as const };
  } catch (error: any) {
    console.error("Error updating decision:", error);
    return rejectWithValue(error.message || "Failed to update decision");
  }
});

export const deleteDecisionThunk = createAsyncThunk<
  string | number,
  string | number,
  {
    state: RootState;
    rejectValue: string;
  }
>("decisionHelper/deleteDecision", async (id, { rejectWithValue }) => {
  try {
    await deleteDecision(id);
    return id;
  } catch (error: any) {
    console.error("Error deleting decision:", error);
    return rejectWithValue(error.message || "Failed to delete decision");
  }
});

// Thunk to fetch all data at once
export const fetchAllDecisionHelperData = createAsyncThunk<
  void,
  void,
  {
    state: RootState;
    rejectValue: string;
  }
>("decisionHelper/fetchAllData", async (_, { dispatch, rejectWithValue }) => {
  try {
    await Promise.all([dispatch(fetchCalendarEvents()), dispatch(fetchCommonDecisions()), dispatch(fetchTasks()), dispatch(fetchProjects())]);
  } catch (error: any) {
    console.error("Error fetching all decision helper data:", error);
    return rejectWithValue(error.message || "Failed to fetch data");
  }
});

const decisionHelperSlice = createSlice({
  name: "decisionHelper",
  initialState,
  reducers: {
    setTabValue: (state, action: PayloadAction<number>) => {
      state.tabValue = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },

    // Task management actions
    setTaskShowForm: (state, action: PayloadAction<boolean>) => {
      state.taskShowForm = action.payload;
    },
    setNewTask: (state, action: PayloadAction<TaskFormState>) => {
      state.newTask = action.payload;
    },
    updateNewTask: (state, action: PayloadAction<Partial<TaskFormState>>) => {
      state.newTask = { ...state.newTask, ...action.payload };
    },
    setEditingTaskId: (state, action: PayloadAction<string | number | null>) => {
      state.editingTaskId = action.payload;
    },
    setEditedTask: (state, action: PayloadAction<Task | null>) => {
      state.editedTask = action.payload;
    },
    updateEditedTask: (state, action: PayloadAction<Partial<Task>>) => {
      if (state.editedTask) {
        state.editedTask = { ...state.editedTask, ...action.payload };
      }
    },
    setEditedTaskTags: (state, action: PayloadAction<string[]>) => {
      state.editedTaskTags = action.payload;
    },
    setTaskDecision: (state, action: PayloadAction<{ id: string; value: number }>) => {
      state.taskDecisions[action.payload.id] = action.payload.value;
    },
    setTagFilter: (state, action: PayloadAction<string>) => {
      state.tagFilter = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<"All" | "Completed" | "Not Completed">) => {
      state.statusFilter = action.payload;
    },
    setAvailableTags: (state, action: PayloadAction<string[]>) => {
      state.availableTags = action.payload;
    },
    setAddTagInputValue: (state, action: PayloadAction<string>) => {
      state.addTagInputValue = action.payload;
    },
    setNewTagInput: (state, action: PayloadAction<string>) => {
      state.newTagInput = action.payload;
    },
    setTaskNotification: (state, action: PayloadAction<{ message: string; type: "success" | "error" | null } | null>) => {
      state.taskNotification = action.payload;
    },
    setProjectFilter: (state, action: PayloadAction<string | "All">) => {
      state.projectFilter = action.payload;
    },

    // Event management actions
    setEventShowForm: (state, action: PayloadAction<boolean>) => {
      state.eventShowForm = action.payload;
    },
    setNewEvent: (state, action: PayloadAction<EventFormState>) => {
      state.newEvent = action.payload;
    },
    updateNewEvent: (state, action: PayloadAction<Partial<EventFormState>>) => {
      state.newEvent = { ...state.newEvent, ...action.payload };
    },
    setEditingEventId: (state, action: PayloadAction<string | number | null>) => {
      state.editingEventId = action.payload;
    },
    setEditedEvent: (state, action: PayloadAction<Event | null>) => {
      state.editedEvent = action.payload;
    },
    updateEditedEvent: (state, action: PayloadAction<Partial<Event>>) => {
      if (state.editedEvent) {
        state.editedEvent = { ...state.editedEvent, ...action.payload };
      }
    },
    setEventDecision: (state, action: PayloadAction<{ id: string; value: number }>) => {
      state.eventDecisions[action.payload.id] = action.payload.value;
    },
    setDateFilter: (state, action: PayloadAction<string>) => {
      state.dateFilter = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<"Ascending" | "Descending">) => {
      state.sortOrder = action.payload;
    },
    setHidePastDates: (state, action: PayloadAction<boolean>) => {
      state.hidePastDates = action.payload;
    },

    // Project management actions
    setProjectShowForm: (state, action: PayloadAction<boolean>) => {
      state.projectShowForm = action.payload;
    },
    setNewProject: (state, action: PayloadAction<Omit<Project, "id">>) => {
      state.newProject = action.payload;
    },
    updateNewProject: (state, action: PayloadAction<Partial<Omit<Project, "id">>>) => {
      state.newProject = { ...state.newProject, ...action.payload };
    },
    setEditingProjectId: (state, action: PayloadAction<string | number | null>) => {
      state.editingProjectId = action.payload;
    },
    setEditedProject: (state, action: PayloadAction<Omit<Project, "id" | "type"> | null>) => {
      state.editedProject = action.payload;
    },
    updateEditedProject: (state, action: PayloadAction<Partial<Omit<Project, "id" | "type">>>) => {
      if (state.editedProject) {
        state.editedProject = { ...state.editedProject, ...action.payload };
      }
    },

    // Common decision management actions
    setDecisionShowForm: (state, action: PayloadAction<boolean>) => {
      state.decisionShowForm = action.payload;
    },
    setNewDecision: (state, action: PayloadAction<{ name: string }>) => {
      state.newDecision = action.payload;
    },
    updateNewDecision: (state, action: PayloadAction<Partial<{ name: string }>>) => {
      state.newDecision = { ...state.newDecision, ...action.payload };
    },
    setEditingDecisionId: (state, action: PayloadAction<string | number | null>) => {
      state.editingDecisionId = action.payload;
    },
    setEditedDecision: (state, action: PayloadAction<{ name: string }>) => {
      state.editedDecision = action.payload;
    },
    updateEditedDecision: (state, action: PayloadAction<Partial<{ name: string }>>) => {
      state.editedDecision = { ...state.editedDecision, ...action.payload };
    },
    setCommonDecisionResult: (state, action: PayloadAction<{ id: string; value: number }>) => {
      state.commonDecisionResults[action.payload.id] = action.payload.value;
    },

    // Individual data setters if needed for optimistic updates
    setCalendarEvents: (state, action: PayloadAction<Event[]>) => {
      state.calendarEvents = action.payload;
    },
    setCommonDecisions: (state, action: PayloadAction<CommonDecision[]>) => {
      state.commonDecisions = action.payload;
    },
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
      // Update available tags when tasks change
      const tags = new Set<string>();
      action.payload.forEach((task) => {
        if (task.tags) {
          task.tags.forEach((tag) => tags.add(tag));
        }
      });
      state.availableTags = Array.from(tags);
    },
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchAllDecisionHelperData lifecycle
      .addCase(fetchAllDecisionHelperData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllDecisionHelperData.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchAllDecisionHelperData.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch decision helper data";
      })

      // Handle individual fetch actions
      .addCase(fetchCalendarEvents.fulfilled, (state, action: PayloadAction<Event[]>) => {
        state.calendarEvents = action.payload;
      })
      .addCase(fetchCalendarEvents.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to fetch calendar events";
      })
      .addCase(fetchCommonDecisions.fulfilled, (state, action: PayloadAction<CommonDecision[]>) => {
        state.commonDecisions = action.payload;
      })
      .addCase(fetchCommonDecisions.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to fetch common decisions";
      })
      .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.tasks = action.payload;
        // Update available tags when tasks are fetched
        const tags = new Set<string>();
        action.payload.forEach((task) => {
          if (task.tags) {
            task.tags.forEach((tag) => tags.add(tag));
          }
        });
        state.availableTags = Array.from(tags);
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to fetch tasks";
      })
      .addCase(fetchProjects.fulfilled, (state, action: PayloadAction<Project[]>) => {
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to fetch projects";
      })

      // Handle task CRUD operations
      .addCase(createTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.tasks.push(action.payload);
        state.taskShowForm = false;
        state.newTask = { name: "", is_completed: false, tags: [], projectId: undefined };
      })
      .addCase(createTask.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to create task";
      })
      .addCase(updateTaskThunk.fulfilled, (state, action: PayloadAction<Task>) => {
        const index = state.tasks.findIndex((task) => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        state.editingTaskId = null;
        state.editedTask = null;
        state.taskNotification = {
          message: `Task "${action.payload.name}" updated successfully.`,
          type: "success",
        };
      })
      .addCase(updateTaskThunk.rejected, (state, action) => {
        state.taskNotification = {
          message: (action.payload as string) || "Failed to update task",
          type: "error",
        };
      })
      .addCase(deleteTaskThunk.fulfilled, (state, action: PayloadAction<string | number>) => {
        state.tasks = state.tasks.filter((task) => task.id !== action.payload);
      })
      .addCase(deleteTaskThunk.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to delete task";
      })

      // Handle event CRUD operations
      .addCase(createEvent.fulfilled, (state, action: PayloadAction<Event>) => {
        state.calendarEvents.push(action.payload);
        state.eventShowForm = false;
        state.newEvent = { name: "", date: "", startTime: "", endTime: "", attended: false };
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to create event";
      })
      .addCase(updateEventThunk.fulfilled, (state, action: PayloadAction<Event>) => {
        const index = state.calendarEvents.findIndex((event) => event.id === action.payload.id);
        if (index !== -1) {
          state.calendarEvents[index] = action.payload;
        }
        state.editingEventId = null;
        state.editedEvent = null;
      })
      .addCase(updateEventThunk.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to update event";
      })
      .addCase(deleteEventThunk.fulfilled, (state, action: PayloadAction<string | number>) => {
        state.calendarEvents = state.calendarEvents.filter((event) => event.id !== action.payload);
      })
      .addCase(deleteEventThunk.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to delete event";
      })

      // Handle project CRUD operations
      .addCase(createProject.fulfilled, (state, action: PayloadAction<Project>) => {
        state.projects.push(action.payload);
        state.projectShowForm = false;
        state.newProject = { name: "", description: "", dueDate: "" };
      })
      .addCase(createProject.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to create project";
      })
      .addCase(updateProjectThunk.fulfilled, (state, action: PayloadAction<Project>) => {
        const index = state.projects.findIndex((project) => project.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        state.editingProjectId = null;
        state.editedProject = null;
      })
      .addCase(updateProjectThunk.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to update project";
      })
      .addCase(deleteProjectThunk.fulfilled, (state, action: PayloadAction<string | number>) => {
        state.projects = state.projects.filter((project) => project.id !== action.payload);
      })
      .addCase(deleteProjectThunk.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to delete project";
      })

      // Handle common decision CRUD operations
      .addCase(createDecision.fulfilled, (state, action: PayloadAction<CommonDecision>) => {
        state.commonDecisions.push(action.payload);
        state.decisionShowForm = false;
        state.newDecision = { name: "" };
      })
      .addCase(createDecision.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to create decision";
      })
      .addCase(updateDecisionThunk.fulfilled, (state, action: PayloadAction<CommonDecision>) => {
        const index = state.commonDecisions.findIndex((decision) => decision.id === action.payload.id);
        if (index !== -1) {
          state.commonDecisions[index] = action.payload;
        }
        state.editingDecisionId = null;
        state.editedDecision = { name: "" };
      })
      .addCase(updateDecisionThunk.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to update decision";
      })
      .addCase(deleteDecisionThunk.fulfilled, (state, action: PayloadAction<string | number>) => {
        state.commonDecisions = state.commonDecisions.filter((decision) => decision.id !== action.payload);
      })
      .addCase(deleteDecisionThunk.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to delete decision";
      });
  },
});

export const {
  setTabValue,
  clearError,
  setCalendarEvents,
  setCommonDecisions,
  setTasks,
  setProjects,

  // Task management actions
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
  setAvailableTags,
  setAddTagInputValue,
  setNewTagInput,
  setTaskNotification,
  setProjectFilter,

  // Event management actions
  setEventShowForm,
  setNewEvent,
  updateNewEvent,
  setEditingEventId,
  setEditedEvent,
  updateEditedEvent,
  setEventDecision,
  setDateFilter,
  setSortOrder,
  setHidePastDates,

  // Project management actions
  setProjectShowForm,
  setNewProject,
  updateNewProject,
  setEditingProjectId,
  setEditedProject,
  updateEditedProject,

  // Common decision management actions
  setDecisionShowForm,
  setNewDecision,
  updateNewDecision,
  setEditingDecisionId,
  setEditedDecision,
  updateEditedDecision,
  setCommonDecisionResult,
} = decisionHelperSlice.actions;

export default decisionHelperSlice.reducer;
export type { DecisionHelperState };
