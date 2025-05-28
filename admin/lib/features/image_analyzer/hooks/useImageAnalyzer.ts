import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";
import { RootState } from "@/store/store";
import { setCurrentImage, setSelectedCategory, setCustomPrompt, setIsAnalyzing, addAnalysisResult, setError, clearError, resetImageAnalyzer } from "@/store/imageAnalyzerSlice";
import { ImageAnalysisRequest } from "../types";

export const useImageAnalyzer = () => {
  const dispatch = useDispatch();
  const state = useSelector((state: RootState) => state.imageAnalyzer);

  const analyzeImage = useCallback(
    async (request: ImageAnalysisRequest) => {
      dispatch(setIsAnalyzing(true));
      dispatch(clearError());

      try {
        const response = await fetch("/api/image_analyzer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to analyze image");
        }

        const result = await response.json();
        dispatch(addAnalysisResult(result));
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        dispatch(setError(errorMessage));
        throw error;
      }
    },
    [dispatch]
  );

  const uploadImage = useCallback(
    (imageData: string) => {
      dispatch(setCurrentImage(imageData));
    },
    [dispatch]
  );

  const selectCategory = useCallback(
    (category: string) => {
      dispatch(setSelectedCategory(category));
    },
    [dispatch]
  );

  const updateCustomPrompt = useCallback(
    (prompt: string) => {
      dispatch(setCustomPrompt(prompt));
    },
    [dispatch]
  );

  const clearCurrentError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const reset = useCallback(() => {
    dispatch(resetImageAnalyzer());
  }, [dispatch]);

  return {
    ...state,
    analyzeImage,
    uploadImage,
    selectCategory,
    updateCustomPrompt,
    clearCurrentError,
    reset,
  };
};
