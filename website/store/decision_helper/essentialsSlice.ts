import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../store";

export interface Essential {
  id: string | number;
  title: string;
  description: string;
  completed_times: number;
  due_date: string;
  interval: number; // interval in days
}

interface EssentialsState {
  essentials: Essential[];
  loading: boolean;
  error: string | null;

  // Form management state
  showForm: boolean;
  newEssential: Omit<Essential, "id">;
  editingEssentialId: string | number | null;
  editedEssential: Essential | null;
  essentialDecisions: Record<string, number>;
}

const initialState: EssentialsState = {
  essentials: [],
  loading: false,
  error: null,

  // Form management initial state
  showForm: false,
  newEssential: { title: "", description: "", completed_times: 0, due_date: "", interval: 1 },
  editingEssentialId: null,
  editedEssential: null,
  essentialDecisions: {},
};

// Essentials management thunks
export const fetchEssentials = createAsyncThunk<
  Essential[],
  void,
  {
    state: RootState;
    rejectValue: string;
  }
>("essentials/fetchEssentials", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/decision_helper/essentials");
    if (!response.ok) {
      const errorText = await response.text();
      return rejectWithValue(errorText || "Failed to fetch essentials");
    }
    const data = await response.json();
    return data as Essential[];
  } catch (error: any) {
    console.error("Error fetching essentials:", error);
    return rejectWithValue(error.message || "Failed to fetch essentials");
  }
});

export const createEssential = createAsyncThunk<
  Essential,
  Omit<Essential, "id">,
  {
    state: RootState;
    rejectValue: string;
  }
>("essentials/createEssential", async (essentialData, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/decision_helper/essentials", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(essentialData),
    });
    if (!response.ok) {
      const errorText = await response.text();
      return rejectWithValue(errorText || "Failed to create essential");
    }
    const data = await response.json();
    return data as Essential;
  } catch (error: any) {
    console.error("Error creating essential:", error);
    return rejectWithValue(error.message || "Failed to create essential");
  }
});

export const updateEssential = createAsyncThunk<
  Essential,
  { id: string | number; essentialData: Partial<Essential> },
  {
    state: RootState;
    rejectValue: string;
  }
>("essentials/updateEssential", async ({ id, essentialData }, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/decision_helper/essentials?id=${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(essentialData),
    });
    if (!response.ok) {
      const errorText = await response.text();
      return rejectWithValue(errorText || "Failed to update essential");
    }
    const data = await response.json();
    return data as Essential;
  } catch (error: any) {
    console.error("Error updating essential:", error);
    return rejectWithValue(error.message || "Failed to update essential");
  }
});

export const deleteEssential = createAsyncThunk<
  string | number,
  string | number,
  {
    state: RootState;
    rejectValue: string;
  }
>("essentials/deleteEssential", async (id, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/decision_helper/essentials?id=${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const errorText = await response.text();
      return rejectWithValue(errorText || "Failed to delete essential");
    }
    return id;
  } catch (error: any) {
    console.error("Error deleting essential:", error);
    return rejectWithValue(error.message || "Failed to delete essential");
  }
});

export const completeEssential = createAsyncThunk<
  Essential,
  string | number,
  {
    state: RootState;
    rejectValue: string;
  }
>("essentials/completeEssential", async (essentialId, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/decision_helper/essentials/${essentialId}/complete`, {
      method: "POST",
    });
    if (!response.ok) {
      const errorText = await response.text();
      return rejectWithValue(errorText || `Failed to complete essential ${essentialId}`);
    }
    const data = await response.json();
    return data as Essential;
  } catch (error: any) {
    console.error(`Error completing essential ${essentialId}:`, error);
    return rejectWithValue(error.message || `Failed to complete essential ${essentialId}`);
  }
});

const essentialsSlice = createSlice({
  name: "essentials",
  initialState,
  reducers: {
    setEssentials: (state, action: PayloadAction<Essential[]>) => {
      state.essentials = action.payload;
    },
    clearEssentialsError: (state) => {
      state.error = null;
    },

    // Form management actions
    setShowForm: (state, action: PayloadAction<boolean>) => {
      state.showForm = action.payload;
    },
    setNewEssential: (state, action: PayloadAction<Omit<Essential, "id">>) => {
      state.newEssential = action.payload;
    },
    updateNewEssential: (state, action: PayloadAction<Partial<Omit<Essential, "id">>>) => {
      state.newEssential = { ...state.newEssential, ...action.payload };
    },
    setEditingEssentialId: (state, action: PayloadAction<string | number | null>) => {
      state.editingEssentialId = action.payload;
    },
    setEditedEssential: (state, action: PayloadAction<Essential | null>) => {
      state.editedEssential = action.payload;
    },
    updateEditedEssential: (state, action: PayloadAction<Partial<Essential>>) => {
      if (state.editedEssential) {
        state.editedEssential = { ...state.editedEssential, ...action.payload };
      }
    },
    setEssentialDecision: (state, action: PayloadAction<{ id: string; value: number }>) => {
      state.essentialDecisions[action.payload.id] = action.payload.value;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEssentials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEssentials.fulfilled, (state, action: PayloadAction<Essential[]>) => {
        state.essentials = action.payload;
        state.loading = false;
      })
      .addCase(fetchEssentials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch essentials";
      })

      // Create essential
      .addCase(createEssential.fulfilled, (state, action: PayloadAction<Essential>) => {
        state.essentials.push(action.payload);
        state.showForm = false;
        state.newEssential = { title: "", description: "", completed_times: 0, due_date: "", interval: 1 };
      })
      .addCase(createEssential.rejected, (state, action) => {
        state.error = action.payload || "Failed to create essential";
      })

      // Update essential
      .addCase(updateEssential.fulfilled, (state, action: PayloadAction<Essential>) => {
        const index = state.essentials.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.essentials[index] = action.payload;
        }
        state.editingEssentialId = null;
        state.editedEssential = null;
      })
      .addCase(updateEssential.rejected, (state, action) => {
        state.error = action.payload || "Failed to update essential";
      })

      // Delete essential
      .addCase(deleteEssential.fulfilled, (state, action: PayloadAction<string | number>) => {
        state.essentials = state.essentials.filter((e) => e.id !== action.payload);
      })
      .addCase(deleteEssential.rejected, (state, action) => {
        state.error = action.payload || "Failed to delete essential";
      })

      // Complete essential
      .addCase(completeEssential.fulfilled, (state, action: PayloadAction<Essential>) => {
        const completedEssential = action.payload;
        const index = state.essentials.findIndex((e) => e.id === completedEssential.id);
        if (index !== -1) {
          state.essentials[index] = completedEssential;
        }
      });
  },
});

export const { setEssentials, clearEssentialsError, setShowForm, setNewEssential, updateNewEssential, setEditingEssentialId, setEditedEssential, updateEditedEssential, setEssentialDecision } = essentialsSlice.actions;
export default essentialsSlice.reducer;
export type { EssentialsState };
