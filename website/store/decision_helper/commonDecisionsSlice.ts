import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { CommonDecision } from "../../app/features/decision_helper/types";
import { addDecision, updateDecision, deleteDecision } from "../../app/features/decision_helper/queries/decision_queries";

interface CommonDecisionsState {
  commonDecisions: CommonDecision[];
  loading: boolean;
  error: string | null;

  // Common decisions management state
  decisionShowForm: boolean;
  newDecision: { name: string };
  editingDecisionId: string | number | null;
  editedDecision: { name: string };
  commonDecisionResults: Record<string, number>;
}

const initialState: CommonDecisionsState = {
  commonDecisions: [],
  loading: false,
  error: null,

  // Common decisions initial state
  decisionShowForm: false,
  newDecision: { name: "" },
  editingDecisionId: null,
  editedDecision: { name: "" },
  commonDecisionResults: {},
};

// Async Thunks for common decisions
export const fetchCommonDecisions = createAsyncThunk<
  CommonDecision[],
  void,
  {
    state: RootState;
    rejectValue: string;
  }
>("commonDecisions/fetchCommonDecisions", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/decision_helper/decisions", { next: { revalidate: 300 } });
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

export const createDecision = createAsyncThunk<
  CommonDecision,
  string,
  {
    state: RootState;
    rejectValue: string;
  }
>("commonDecisions/createDecision", async (name, { rejectWithValue }) => {
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
>("commonDecisions/updateDecision", async ({ id, name }, { rejectWithValue }) => {
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
>("commonDecisions/deleteDecision", async (id, { rejectWithValue }) => {
  try {
    await deleteDecision(id);
    return id;
  } catch (error: any) {
    console.error("Error deleting decision:", error);
    return rejectWithValue(error.message || "Failed to delete decision");
  }
});

const commonDecisionsSlice = createSlice({
  name: "commonDecisions",
  initialState,
  reducers: {
    setCommonDecisions: (state, action: PayloadAction<CommonDecision[]>) => {
      state.commonDecisions = action.payload;
    },
    clearCommonDecisionsError: (state) => {
      state.error = null;
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommonDecisions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommonDecisions.fulfilled, (state, action: PayloadAction<CommonDecision[]>) => {
        state.commonDecisions = action.payload;
        state.loading = false;
      })
      .addCase(fetchCommonDecisions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch common decisions";
      })

      // Handle common decision CRUD operations
      .addCase(createDecision.fulfilled, (state, action: PayloadAction<CommonDecision>) => {
        state.commonDecisions.push(action.payload);
        state.decisionShowForm = false;
        state.newDecision = { name: "" };
      })
      .addCase(createDecision.rejected, (state, action) => {
        state.error = action.payload || "Failed to create decision";
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
        state.error = action.payload || "Failed to update decision";
      })
      .addCase(deleteDecisionThunk.fulfilled, (state, action: PayloadAction<string | number>) => {
        state.commonDecisions = state.commonDecisions.filter((decision) => decision.id !== action.payload);
      })
      .addCase(deleteDecisionThunk.rejected, (state, action) => {
        state.error = action.payload || "Failed to delete decision";
      });
  },
});

export const { setCommonDecisions, clearCommonDecisionsError, setDecisionShowForm, setNewDecision, updateNewDecision, setEditingDecisionId, setEditedDecision, updateEditedDecision, setCommonDecisionResult } = commonDecisionsSlice.actions;

export default commonDecisionsSlice.reducer;
export type { CommonDecisionsState };
