import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ImageAnalyzerState, ImageAnalysisResult, DEFAULT_CATEGORIES } from "@/lib/features/image_analyzer/types";

const initialState: ImageAnalyzerState = {
  currentImage: null,
  selectedCategory: "general",
  customPrompt: "",
  analysisResults: [],
  isAnalyzing: false,
  error: null,
  categories: DEFAULT_CATEGORIES,
};

const imageAnalyzerSlice = createSlice({
  name: "imageAnalyzer",
  initialState,
  reducers: {
    setCurrentImage: (state, action: PayloadAction<string | null>) => {
      state.currentImage = action.payload;
      state.error = null;
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
      state.customPrompt = "";
    },
    setCustomPrompt: (state, action: PayloadAction<string>) => {
      state.customPrompt = action.payload;
    },
    setIsAnalyzing: (state, action: PayloadAction<boolean>) => {
      state.isAnalyzing = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    addAnalysisResult: (state, action: PayloadAction<ImageAnalysisResult>) => {
      state.analysisResults.unshift(action.payload);
      state.isAnalyzing = false;
    },
    removeAnalysisResult: (state, action: PayloadAction<string>) => {
      state.analysisResults = state.analysisResults.filter((result) => result.id !== action.payload);
    },
    clearAnalysisResults: (state) => {
      state.analysisResults = [];
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isAnalyzing = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetImageAnalyzer: (state) => {
      state.currentImage = null;
      state.selectedCategory = "general";
      state.customPrompt = "";
      state.error = null;
      state.isAnalyzing = false;
    },
  },
});

export const { setCurrentImage, setSelectedCategory, setCustomPrompt, setIsAnalyzing, addAnalysisResult, removeAnalysisResult, clearAnalysisResults, setError, clearError, resetImageAnalyzer } = imageAnalyzerSlice.actions;

export default imageAnalyzerSlice.reducer;
