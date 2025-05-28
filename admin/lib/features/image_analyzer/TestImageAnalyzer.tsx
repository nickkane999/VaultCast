"use client";

import React, { useState } from "react";
import { Box, Button, Typography, Alert, CircularProgress, Paper } from "@mui/material";
import { Psychology, Science } from "@mui/icons-material";

export default function TestImageAnalyzer() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Test image: A simple test image URL (you can replace with any public image URL)
  const testImageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg";

  const runTest = async () => {
    setTesting(true);
    setResult(null);
    setError(null);

    try {
      // Convert URL to base64 for testing
      const response = await fetch(testImageUrl);
      const blob = await response.blob();

      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;

        try {
          const apiResponse = await fetch("/api/image_analyzer", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              imageData: base64Data,
              category: "general",
              customPrompt: "What do you see in this image? Describe it in detail.",
            }),
          });

          if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            throw new Error(errorData.error || "API request failed");
          }

          const analysisResult = await apiResponse.json();
          setResult(analysisResult.result);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Unknown error occurred");
        } finally {
          setTesting(false);
        }
      };

      reader.readAsDataURL(blob);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load test image");
      setTesting(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, m: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Science sx={{ color: "primary.main" }} />
        <Typography variant="h6">API Test</Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Test the image analyzer API with a sample image to verify it's working correctly.
      </Typography>

      <Button variant="contained" onClick={runTest} disabled={testing} startIcon={testing ? <CircularProgress size={20} /> : <Psychology />} sx={{ mb: 2 }}>
        {testing ? "Testing API..." : "Run API Test"}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Test Failed:</Typography>
          {error}
        </Alert>
      )}

      {result && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Test Successful!</Typography>
          <Typography variant="body2" sx={{ mt: 1, whiteSpace: "pre-wrap" }}>
            {result}
          </Typography>
        </Alert>
      )}

      <Typography variant="caption" color="text.secondary">
        Test image: Nature boardwalk from Wikimedia Commons
      </Typography>
    </Paper>
  );
}
