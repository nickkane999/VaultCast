import { useSelector, useDispatch } from "react-redux";
import { useCallback, useEffect } from "react";
import { RootState, AppDispatch } from "@/store/store";
import {
  analyzeMarketing,
  saveQuery,
  loadSavedQueries,
  deleteQuery,
  setCurrentQuery,
  setCurrentPlatform,
  setCurrentTargetAudience,
  setCurrentBudget,
  setCurrentExperience,
  loadQueryData,
  selectAnalysis,
  removeAnalysis,
  clearAnalyses,
  clearError,
  removeSavedQuery,
  resetForm,
} from "../store/marketingLinksSlice";
import { AnalyzeMarketingRequest, MarketingQuery } from "../types";

export const useMarketingLinks = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { currentQuery, currentPlatform, currentTargetAudience, currentBudget, currentExperience, isAnalyzing, analyses, savedQueries, error, selectedAnalysis } = useSelector((state: RootState) => state.marketingLinks);

  const currentAnalysis = analyses.find((analysis) => analysis.id === selectedAnalysis);

  useEffect(() => {
    dispatch(loadSavedQueries());
  }, [dispatch]);

  const analyze = useCallback(
    async (request: AnalyzeMarketingRequest) => {
      return dispatch(analyzeMarketing(request));
    },
    [dispatch]
  );

  const updateQuery = useCallback(
    (query: string) => {
      dispatch(setCurrentQuery(query));
    },
    [dispatch]
  );

  const updatePlatform = useCallback(
    (platform: string) => {
      dispatch(setCurrentPlatform(platform));
    },
    [dispatch]
  );

  const updateTargetAudience = useCallback(
    (audience: string) => {
      dispatch(setCurrentTargetAudience(audience));
    },
    [dispatch]
  );

  const updateBudget = useCallback(
    (budget: string) => {
      dispatch(setCurrentBudget(budget));
    },
    [dispatch]
  );

  const updateExperience = useCallback(
    (experience: string) => {
      dispatch(setCurrentExperience(experience));
    },
    [dispatch]
  );

  const loadQuery = useCallback(
    (query: MarketingQuery) => {
      dispatch(loadQueryData(query));
    },
    [dispatch]
  );

  const selectCurrentAnalysis = useCallback(
    (analysisId: string | null) => {
      dispatch(selectAnalysis(analysisId));
    },
    [dispatch]
  );

  const deleteAnalysis = useCallback(
    (analysisId: string) => {
      dispatch(removeAnalysis(analysisId));
    },
    [dispatch]
  );

  const clearAllAnalyses = useCallback(() => {
    dispatch(clearAnalyses());
  }, [dispatch]);

  const saveCurrentQuery = useCallback(
    async (queryData: Omit<MarketingQuery, "id" | "createdAt">) => {
      return dispatch(saveQuery(queryData));
    },
    [dispatch]
  );

  const deleteSavedQuery = useCallback(
    async (queryId: string) => {
      return dispatch(deleteQuery(queryId));
    },
    [dispatch]
  );

  const clearCurrentError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const resetFormData = useCallback(() => {
    dispatch(resetForm());
  }, [dispatch]);

  return {
    // Current form state
    currentQuery,
    currentPlatform,
    currentTargetAudience,
    currentBudget,
    currentExperience,
    // Analysis state
    isAnalyzing,
    analyses,
    savedQueries,
    error,
    selectedAnalysis,
    currentAnalysis,
    // Form actions
    updateQuery,
    updatePlatform,
    updateTargetAudience,
    updateBudget,
    updateExperience,
    loadQuery,
    resetFormData,
    // Analysis actions
    analyze,
    selectCurrentAnalysis,
    deleteAnalysis,
    clearAllAnalyses,
    saveCurrentQuery,
    deleteSavedQuery,
    clearCurrentError,
  };
};
