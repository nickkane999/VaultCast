"use client";

import React, { useState } from "react";
import { Box, Button, Paper, Typography, Grid, FormControl, InputLabel, Select, MenuItem, CircularProgress, Chip, Alert } from "@mui/material";
import { TrendingUp, Psychology, Search, Save } from "@mui/icons-material";
import IsolatedTextField from "@/lib/components/IsolatedTextField";
import { useMarketingLinks } from "../hooks/useMarketingLinks";

const PLATFORM_OPTIONS = [
  { value: "any", label: "Any Platform" },
  { value: "amazon", label: "Amazon" },
  { value: "social", label: "Social Media" },
  { value: "blog", label: "Blog/Website" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
];

const AUDIENCE_OPTIONS = [
  { value: "general", label: "General Audience" },
  { value: "millennials", label: "Millennials (25-40)" },
  { value: "gen-z", label: "Gen Z (18-25)" },
  { value: "parents", label: "Parents" },
  { value: "professionals", label: "Working Professionals" },
  { value: "students", label: "Students" },
  { value: "seniors", label: "Seniors (55+)" },
];

const BUDGET_OPTIONS = [
  { value: "low", label: "$0 - $100" },
  { value: "medium", label: "$100 - $500" },
  { value: "high", label: "$500 - $2000" },
  { value: "enterprise", label: "$2000+" },
];

const EXPERIENCE_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const EXAMPLE_QUERIES = ["I want to sell running shoes to fitness enthusiasts", "Help me find profitable kitchen gadgets for busy parents", "I want to promote tech accessories for remote workers", "Find trending beauty products for Gen Z", "Help me market home improvement tools"];

interface MarketingQueryFormProps {
  onAnalyze?: () => void;
}

export default function MarketingQueryForm({ onAnalyze }: MarketingQueryFormProps) {
  const { currentQuery, currentPlatform, currentTargetAudience, currentBudget, currentExperience, isAnalyzing, error, updateQuery, updatePlatform, updateTargetAudience, updateBudget, updateExperience, analyze, saveCurrentQuery, clearCurrentError } = useMarketingLinks();

  const [saveMessage, setSaveMessage] = useState("");

  const handleAnalyze = async () => {
    if (!currentQuery.trim()) return;

    try {
      await analyze({
        query: currentQuery,
        platform: currentPlatform !== "any" ? currentPlatform : undefined,
        targetAudience: currentTargetAudience !== "general" ? currentTargetAudience : undefined,
        budget: currentBudget,
        experience: currentExperience,
      });
      onAnalyze?.();
    } catch (error) {
      console.error("Analysis failed:", error);
    }
  };

  const handleSaveQuery = async () => {
    if (!currentQuery.trim()) return;

    try {
      await saveCurrentQuery({
        query: currentQuery,
        platform: currentPlatform !== "any" ? currentPlatform : undefined,
        targetAudience: currentTargetAudience !== "general" ? currentTargetAudience : undefined,
        budget: currentBudget,
        experience: currentExperience,
      });
      setSaveMessage("Query saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  const handleExampleClick = (example: string) => {
    updateQuery(example);
  };

  const canAnalyze = currentQuery.trim() && !isAnalyzing;
  const canSave = currentQuery.trim() && !isAnalyzing;

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <TrendingUp sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
        <Typography variant="h5" component="h2" gutterBottom>
          AI Affiliate Marketing Assistant
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tell us what you want to market, and we'll find trending keywords and affiliate opportunities
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={clearCurrentError}>
          {error}
        </Alert>
      )}

      {saveMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {saveMessage}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Psychology fontSize="small" />
          What do you want to market?
        </Typography>
        <IsolatedTextField fullWidth multiline rows={3} placeholder="e.g., I want to sell running shoes to fitness enthusiasts, or I need to find profitable kitchen gadgets for busy parents..." value={currentQuery} onDebouncedChange={updateQuery} variant="outlined" sx={{ mb: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Try these examples:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {EXAMPLE_QUERIES.map((example, index) => (
              <Chip key={index} label={example} variant="outlined" size="small" onClick={() => handleExampleClick(example)} sx={{ cursor: "pointer", "&:hover": { backgroundColor: "action.hover" } }} />
            ))}
          </Box>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            <InputLabel>Platform</InputLabel>
            <Select value={currentPlatform} label="Platform" onChange={(e) => updatePlatform(e.target.value)}>
              {PLATFORM_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            <InputLabel>Target Audience</InputLabel>
            <Select value={currentTargetAudience} label="Target Audience" onChange={(e) => updateTargetAudience(e.target.value)}>
              {AUDIENCE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            <InputLabel>Budget</InputLabel>
            <Select value={currentBudget} label="Budget" onChange={(e) => updateBudget(e.target.value)}>
              {BUDGET_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            <InputLabel>Experience Level</InputLabel>
            <Select value={currentExperience} label="Experience Level" onChange={(e) => updateExperience(e.target.value)}>
              {EXPERIENCE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="contained" size="large" onClick={handleAnalyze} disabled={!canAnalyze} startIcon={isAnalyzing ? <CircularProgress size={20} /> : <Search />} sx={{ flex: 1 }}>
          {isAnalyzing ? "Analyzing..." : "Find Opportunities"}
        </Button>

        <Button variant="outlined" size="large" onClick={handleSaveQuery} disabled={!canSave} startIcon={<Save />}>
          Save Query
        </Button>
      </Box>
    </Paper>
  );
}
