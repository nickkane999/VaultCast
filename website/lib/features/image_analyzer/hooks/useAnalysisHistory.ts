import { useState, useEffect, useCallback } from "react";
import { ImageAnalysisResult } from "../types";

interface UseAnalysisHistoryOptions {
  limit?: number;
  category?: string;
  autoLoad?: boolean;
}

export const useAnalysisHistory = (options: UseAnalysisHistoryOptions = {}) => {
  const { limit = 10, category, autoLoad = true } = options;

  const [history, setHistory] = useState<ImageAnalysisResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("limit", limit.toString());
      if (category) {
        params.append("category", category);
      }

      const response = await fetch(`/api/image_analyzer?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to load analysis history");
      }

      const data = await response.json();
      setHistory(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Failed to load analysis history:", err);
    } finally {
      setLoading(false);
    }
  }, [limit, category]);

  const refreshHistory = useCallback(() => {
    loadHistory();
  }, [loadHistory]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setError(null);
  }, []);

  useEffect(() => {
    if (autoLoad) {
      loadHistory();
    }
  }, [autoLoad, loadHistory]);

  return {
    history,
    loading,
    error,
    loadHistory,
    refreshHistory,
    clearHistory,
  };
};
