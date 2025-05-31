import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { MarketingLinksState, MarketingAnalysis, MarketingQuery, AnalyzeMarketingRequest } from "../types";

const initialState: MarketingLinksState = {
  currentQuery: "",
  currentPlatform: "any",
  currentTargetAudience: "general",
  currentBudget: "medium",
  currentExperience: "beginner",
  isAnalyzing: false,
  analyses: [],
  savedQueries: [],
  error: null,
  selectedAnalysis: null,
};

export const analyzeMarketing = createAsyncThunk("marketingLinks/analyze", async (request: AnalyzeMarketingRequest, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/marketing-links/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Analysis failed");
    }

    const analysis = await response.json();
    return analysis as MarketingAnalysis;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Analysis failed");
  }
});

export const saveQuery = createAsyncThunk("marketingLinks/saveQuery", async (query: Omit<MarketingQuery, "id" | "createdAt">, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/marketing-links/queries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(query),
    });

    if (!response.ok) {
      throw new Error("Failed to save query");
    }

    const savedQuery = await response.json();
    return savedQuery as MarketingQuery;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to save query");
  }
});

export const deleteQuery = createAsyncThunk("marketingLinks/deleteQuery", async (queryId: string, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/marketing-links/queries?id=${queryId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete query");
    }

    return queryId;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to delete query");
  }
});

export const loadSavedQueries = createAsyncThunk("marketingLinks/loadQueries", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/marketing-links/queries");

    if (!response.ok) {
      throw new Error("Failed to load queries");
    }

    const queries = await response.json();
    return queries as MarketingQuery[];
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to load queries");
  }
});

const marketingLinksSlice = createSlice({
  name: "marketingLinks",
  initialState,
  reducers: {
    setCurrentQuery: (state, action: PayloadAction<string>) => {
      state.currentQuery = action.payload;
      state.error = null;
    },
    setCurrentPlatform: (state, action: PayloadAction<string>) => {
      state.currentPlatform = action.payload;
    },
    setCurrentTargetAudience: (state, action: PayloadAction<string>) => {
      state.currentTargetAudience = action.payload;
    },
    setCurrentBudget: (state, action: PayloadAction<string>) => {
      state.currentBudget = action.payload;
    },
    setCurrentExperience: (state, action: PayloadAction<string>) => {
      state.currentExperience = action.payload;
    },
    loadQueryData: (state, action: PayloadAction<MarketingQuery>) => {
      const query = action.payload;
      state.currentQuery = query.query;
      state.currentPlatform = query.platform || "any";
      state.currentTargetAudience = query.targetAudience || "general";
      state.currentBudget = query.budget || "medium";
      state.currentExperience = query.experience || "beginner";
      state.error = null;
    },
    selectAnalysis: (state, action: PayloadAction<string | null>) => {
      state.selectedAnalysis = action.payload;
    },
    removeAnalysis: (state, action: PayloadAction<string>) => {
      state.analyses = state.analyses.filter((analysis) => analysis.id !== action.payload);
      if (state.selectedAnalysis === action.payload) {
        state.selectedAnalysis = null;
      }
    },
    clearAnalyses: (state) => {
      state.analyses = [];
      state.selectedAnalysis = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    removeSavedQuery: (state, action: PayloadAction<string>) => {
      state.savedQueries = state.savedQueries.filter((query) => query.id !== action.payload);
    },
    resetForm: (state) => {
      state.currentQuery = "";
      state.currentPlatform = "any";
      state.currentTargetAudience = "general";
      state.currentBudget = "medium";
      state.currentExperience = "beginner";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(analyzeMarketing.pending, (state) => {
        state.isAnalyzing = true;
        state.error = null;
      })
      .addCase(analyzeMarketing.fulfilled, (state, action) => {
        state.isAnalyzing = false;
        state.analyses.unshift(action.payload);
        state.selectedAnalysis = action.payload.id;
      })
      .addCase(analyzeMarketing.rejected, (state, action) => {
        state.isAnalyzing = false;
        state.error = action.payload as string;
      })
      .addCase(saveQuery.fulfilled, (state, action) => {
        state.savedQueries.unshift(action.payload);
      })
      .addCase(saveQuery.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(loadSavedQueries.fulfilled, (state, action) => {
        state.savedQueries = action.payload;
      })
      .addCase(loadSavedQueries.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteQuery.fulfilled, (state, action) => {
        state.savedQueries = state.savedQueries.filter((query) => query.id !== action.payload);
      })
      .addCase(deleteQuery.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentQuery, setCurrentPlatform, setCurrentTargetAudience, setCurrentBudget, setCurrentExperience, loadQueryData, selectAnalysis, removeAnalysis, clearAnalyses, clearError, removeSavedQuery, resetForm } = marketingLinksSlice.actions;

export default marketingLinksSlice.reducer;
