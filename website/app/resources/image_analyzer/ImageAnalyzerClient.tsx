"use client";

import React, { useState } from "react";
import { Box, Typography, Button, Alert, Grid, Paper, CircularProgress } from "@mui/material";
import { Analytics, Psychology } from "@mui/icons-material";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { useImageAnalyzer } from "@/lib/features/image_analyzer/hooks/useImageAnalyzer";
import ImageUploadZone from "@/lib/features/image_analyzer/ImageUploadZone";
import CategorySelector from "@/lib/features/image_analyzer/CategorySelector";
import AnalysisResults from "@/lib/features/image_analyzer/AnalysisResults";
import TestImageAnalyzer from "@/lib/features/image_analyzer/TestImageAnalyzer";
import { removeAnalysisResult, clearAnalysisResults } from "@/store/imageAnalyzerSlice";
import { useDispatch } from "react-redux";

function ImageAnalyzerContent() {
  const dispatch = useDispatch();
  const { currentImage, selectedCategory, customPrompt, analysisResults, isAnalyzing, error, categories, analyzeImage, uploadImage, selectCategory, updateCustomPrompt, clearCurrentError } = useImageAnalyzer();

  const handleAnalyze = async () => {
    if (!currentImage) {
      return;
    }

    try {
      await analyzeImage({
        imageData: currentImage,
        category: selectedCategory,
        customPrompt: customPrompt.trim() || undefined,
      });
    } catch (err) {
      console.error("Analysis failed:", err);
    }
  };

  const handleDeleteResult = (id: string) => {
    dispatch(removeAnalysisResult(id));
  };

  const handleClearAllResults = () => {
    dispatch(clearAnalysisResults());
  };

  const canAnalyze = currentImage && !isAnalyzing;

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Psychology sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom>
          AI Image Analyzer
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Upload any image and get intelligent analysis powered by AI
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Identify animals, celebrities, movies, objects, locations, and more with detailed insights
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={clearCurrentError}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ p: 3, height: "fit-content" }}>
            <Typography variant="h5" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Analytics />
              Analysis Setup
            </Typography>

            <Box sx={{ mb: 3 }}>
              <ImageUploadZone onImageUpload={uploadImage} currentImage={currentImage} />
            </Box>

            <CategorySelector categories={categories} selectedCategory={selectedCategory} customPrompt={customPrompt} onCategoryChange={selectCategory} onCustomPromptChange={updateCustomPrompt} />

            <Button variant="contained" size="large" fullWidth onClick={handleAnalyze} disabled={!canAnalyze} sx={{ mt: 3, py: 1.5 }} startIcon={isAnalyzing ? <CircularProgress size={20} /> : <Psychology />}>
              {isAnalyzing ? "Analyzing Image..." : "Analyze Image"}
            </Button>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ p: 3, height: "fit-content" }}>
            <AnalysisResults results={analysisResults} onDeleteResult={handleDeleteResult} onClearAll={handleClearAllResults} />
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <TestImageAnalyzer />
      </Box>
    </Box>
  );
}

export default function ImageAnalyzerClient() {
  return (
    <Provider store={store}>
      <ImageAnalyzerContent />
    </Provider>
  );
}
