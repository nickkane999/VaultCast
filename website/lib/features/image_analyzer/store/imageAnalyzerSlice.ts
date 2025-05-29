import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ImageAnalyzerState, ImageAnalysisRequest, ImageAnalysisResult, AnalysisCategory, DEFAULT_CATEGORIES } from "../types";

const initialState: ImageAnalyzerState = {
  currentImage: null,
  selectedCategory: "general",
  customPrompt: "",
  analysisResults: [],
  isAnalyzing: false,
  error: null,
  categories: DEFAULT_CATEGORIES,
};

// Async thunks
export const analyzeImage = createAsyncThunk("imageAnalyzer/analyzeImage", async (request: ImageAnalysisRequest) => {
  const response = await fetch("/api/image-analyzer/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Failed to analyze image");
  }

  return response.json();
});

export const fetchAnalysisHistory = createAsyncThunk("imageAnalyzer/fetchAnalysisHistory", async () => {
  const response = await fetch("/api/image-analyzer/history");
  if (!response.ok) {
    throw new Error("Failed to fetch analysis history");
  }
  return response.json();
});

export const deleteAnalysisResult = createAsyncThunk("imageAnalyzer/deleteAnalysisResult", async (resultId: string) => {
  const response = await fetch(`/api/image-analyzer/history/${resultId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete analysis result");
  }
  return resultId;
});

export const saveAnalysisResult = createAsyncThunk("imageAnalyzer/saveAnalysisResult", async (result: Omit<ImageAnalysisResult, "id" | "timestamp">) => {
  const response = await fetch("/api/image-analyzer/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(result),
  });

  if (!response.ok) {
    throw new Error("Failed to save analysis result");
  }

  return response.json();
});

export const uploadImageFile = createAsyncThunk("imageAnalyzer/uploadImageFile", async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("/api/image-analyzer/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload image");
  }

  const result = await response.json();
  return result.imageData; // base64 encoded image
});

const imageAnalyzerSlice = createSlice({
  name: "imageAnalyzer",
  initialState,
  reducers: {
    setCurrentImage: (state, action: PayloadAction<string | null>) => {
      state.currentImage = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
    setCustomPrompt: (state, action: PayloadAction<string>) => {
      state.customPrompt = action.payload;
    },
    addAnalysisResult: (state, action: PayloadAction<ImageAnalysisResult>) => {
      state.analysisResults.unshift(action.payload);
    },
    removeAnalysisResult: (state, action: PayloadAction<string>) => {
      state.analysisResults = state.analysisResults.filter((result) => result.id !== action.payload);
    },
    clearAnalysisResults: (state) => {
      state.analysisResults = [];
    },
    clearCurrentImage: (state) => {
      state.currentImage = null;
      state.customPrompt = "";
    },
    clearError: (state) => {
      state.error = null;
    },
    updateCategories: (state, action: PayloadAction<AnalysisCategory[]>) => {
      state.categories = action.payload;
    },
    resetAnalyzer: (state) => {
      state.currentImage = null;
      state.selectedCategory = "general";
      state.customPrompt = "";
      state.error = null;
      state.isAnalyzing = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(analyzeImage.pending, (state) => {
        state.isAnalyzing = true;
        state.error = null;
      })
      .addCase(analyzeImage.fulfilled, (state, action) => {
        state.isAnalyzing = false;
        const newResult: ImageAnalysisResult = {
          id: Date.now().toString(),
          imageData: state.currentImage || "",
          category: state.selectedCategory,
          prompt: action.meta.arg.customPrompt || state.categories.find((cat) => cat.id === state.selectedCategory)?.prompts[0] || "Analyze this image",
          result: action.payload.analysis,
          confidence: action.payload.confidence,
          timestamp: new Date().toISOString(),
          metadata: action.payload.metadata,
        };
        state.analysisResults.unshift(newResult);
      })
      .addCase(analyzeImage.rejected, (state, action) => {
        state.isAnalyzing = false;
        state.error = action.error.message || "Failed to analyze image";
      })
      .addCase(fetchAnalysisHistory.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchAnalysisHistory.fulfilled, (state, action) => {
        state.analysisResults = action.payload.results || [];
      })
      .addCase(fetchAnalysisHistory.rejected, (state, action) => {
        state.error = action.error.message || "Failed to fetch analysis history";
      })
      .addCase(deleteAnalysisResult.fulfilled, (state, action) => {
        state.analysisResults = state.analysisResults.filter((result) => result.id !== action.payload);
      })
      .addCase(deleteAnalysisResult.rejected, (state, action) => {
        state.error = action.error.message || "Failed to delete analysis result";
      })
      .addCase(saveAnalysisResult.fulfilled, (state, action) => {
        const index = state.analysisResults.findIndex((result) => result.id === action.payload.id);
        if (index !== -1) {
          state.analysisResults[index] = action.payload;
        }
      })
      .addCase(saveAnalysisResult.rejected, (state, action) => {
        state.error = action.error.message || "Failed to save analysis result";
      })
      .addCase(uploadImageFile.pending, (state) => {
        state.error = null;
      })
      .addCase(uploadImageFile.fulfilled, (state, action) => {
        state.currentImage = action.payload;
      })
      .addCase(uploadImageFile.rejected, (state, action) => {
        state.error = action.error.message || "Failed to upload image";
      });
  },
});

export const { setCurrentImage, setSelectedCategory, setCustomPrompt, addAnalysisResult, removeAnalysisResult, clearAnalysisResults, clearCurrentImage, clearError, updateCategories, resetAnalyzer } = imageAnalyzerSlice.actions;

export default imageAnalyzerSlice.reducer;
