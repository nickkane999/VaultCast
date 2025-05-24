import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { Project } from "../../app/features/decision_helper/types";
import { addProject, updateProject, deleteProject } from "../../app/features/decision_helper/queries/project_queries";

interface ProjectFormState {
  name: string;
  description: string;
  dueDate: string;
}

interface ProjectsState {
  projects: Project[];
  loading: boolean;
  error: string | null;

  // Project management state
  projectShowForm: boolean;
  newProject: Omit<Project, "id">;
  editingProjectId: string | number | null;
  editedProject: Omit<Project, "id" | "type"> | null;
}

const initialState: ProjectsState = {
  projects: [],
  loading: false,
  error: null,

  // Project management initial state
  projectShowForm: false,
  newProject: { name: "", description: "", dueDate: "" },
  editingProjectId: null,
  editedProject: null,
};

// Async Thunks for projects
export const fetchProjects = createAsyncThunk<
  Project[],
  void,
  {
    state: RootState;
    rejectValue: string;
  }
>("projects/fetchProjects", async (_, { rejectWithValue }) => {
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

export const createProject = createAsyncThunk<
  Project,
  Omit<Project, "id">,
  {
    state: RootState;
    rejectValue: string;
  }
>("projects/createProject", async (projectData, { rejectWithValue }) => {
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
>("projects/updateProject", async ({ id, projectData }, { rejectWithValue }) => {
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
>("projects/deleteProject", async (id, { rejectWithValue }) => {
  try {
    await deleteProject(id);
    return id;
  } catch (error: any) {
    console.error("Error deleting project:", error);
    return rejectWithValue(error.message || "Failed to delete project");
  }
});

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload;
    },
    clearProjectsError: (state) => {
      state.error = null;
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action: PayloadAction<Project[]>) => {
        state.projects = action.payload;
        state.loading = false;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch projects";
      })

      // Handle project CRUD operations
      .addCase(createProject.fulfilled, (state, action: PayloadAction<Project>) => {
        state.projects.push(action.payload);
        state.projectShowForm = false;
        state.newProject = { name: "", description: "", dueDate: "" };
      })
      .addCase(createProject.rejected, (state, action) => {
        state.error = action.payload || "Failed to create project";
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
        state.error = action.payload || "Failed to update project";
      })
      .addCase(deleteProjectThunk.fulfilled, (state, action: PayloadAction<string | number>) => {
        state.projects = state.projects.filter((project) => project.id !== action.payload);
      })
      .addCase(deleteProjectThunk.rejected, (state, action) => {
        state.error = action.payload || "Failed to delete project";
      });
  },
});

export const { setProjects, clearProjectsError, setProjectShowForm, setNewProject, updateNewProject, setEditingProjectId, setEditedProject, updateEditedProject } = projectsSlice.actions;

export default projectsSlice.reducer;
export type { ProjectsState, ProjectFormState };
