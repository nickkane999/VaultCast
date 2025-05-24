import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { Task } from "../../app/features/decision_helper/types";
import { addTask, updateTask, deleteTask } from "../../app/features/decision_helper/queries/task_queries";

export interface TaskFormState {
  name: string;
  is_completed: boolean;
  tags: string[];
  projectId?: string | undefined;
}

interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;

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
}

const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,

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
};

// Async Thunks for tasks
export const fetchTasks = createAsyncThunk<
  Task[],
  void,
  {
    state: RootState;
    rejectValue: string;
  }
>("tasks/fetchTasks", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/decision_helper/tasks", { next: { revalidate: 300 } });
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

export const createTask = createAsyncThunk<
  Task,
  Omit<Task, "id">,
  {
    state: RootState;
    rejectValue: string;
  }
>("tasks/createTask", async (taskData, { rejectWithValue }) => {
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
>("tasks/updateTask", async ({ id, taskData }, { rejectWithValue }) => {
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
>("tasks/deleteTask", async (id, { rejectWithValue }) => {
  try {
    await deleteTask(id);
    return id;
  } catch (error: any) {
    console.error("Error deleting task:", error);
    return rejectWithValue(error.message || "Failed to delete task");
  }
});

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
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
    clearTasksError: (state) => {
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.tasks = action.payload;
        state.loading = false;
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
        state.loading = false;
        state.error = action.payload || "Failed to fetch tasks";
      })

      // Handle task CRUD operations
      .addCase(createTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.tasks.push(action.payload);
        state.taskShowForm = false;
        state.newTask = { name: "", is_completed: false, tags: [], projectId: undefined };
      })
      .addCase(createTask.rejected, (state, action) => {
        state.error = action.payload || "Failed to create task";
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
          message: action.payload || "Failed to update task",
          type: "error",
        };
      })
      .addCase(deleteTaskThunk.fulfilled, (state, action: PayloadAction<string | number>) => {
        state.tasks = state.tasks.filter((task) => task.id !== action.payload);
      })
      .addCase(deleteTaskThunk.rejected, (state, action) => {
        state.error = action.payload || "Failed to delete task";
      });
  },
});

export const { setTasks, clearTasksError, setTaskShowForm, setNewTask, updateNewTask, setEditingTaskId, setEditedTask, updateEditedTask, setEditedTaskTags, setTaskDecision, setTagFilter, setStatusFilter, setAvailableTags, setAddTagInputValue, setNewTagInput, setTaskNotification, setProjectFilter } =
  tasksSlice.actions;

export default tasksSlice.reducer;
export type { TasksState };
