"use client";

import React, { useState } from "react";
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Button, CircularProgress, Alert, Grid, Paper } from "@mui/material";
import { Refresh, History } from "@mui/icons-material";
import { useAnalysisHistory } from "./hooks/useAnalysisHistory";
import AnalysisCard from "./cards/AnalysisCard";
import { DEFAULT_CATEGORIES } from "./types";

interface AnalysisHistoryProps {
  onResultSelect?: (result: any) => void;
}

export default function AnalysisHistory({ onResultSelect }: AnalysisHistoryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [limit, setLimit] = useState(10);

  const { history, loading, error, refreshHistory } = useAnalysisHistory({
    limit,
    category: selectedCategory === "all" ? undefined : selectedCategory,
    autoLoad: true,
  });

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
  };

  const handleDelete = (id: string) => {
    // TODO: Implement delete functionality with API call
    console.log("Delete analysis:", id);
  };

  const handleShare = (result: any) => {
    // TODO: Implement share functionality
    console.log("Share analysis:", result);
  };

  if (loading && history.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading analysis history...
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <History sx={{ color: "primary.main" }} />
        <Typography variant="h5">Analysis History</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="outlined" startIcon={loading ? <CircularProgress size={16} /> : <Refresh />} onClick={refreshHistory} disabled={loading} size="small">
          Refresh
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Category</InputLabel>
          <Select value={selectedCategory} label="Category" onChange={(e) => handleCategoryChange(e.target.value)}>
            <MenuItem value="all">All Categories</MenuItem>
            {DEFAULT_CATEGORIES.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>Limit</InputLabel>
          <Select value={limit} label="Limit" onChange={(e) => handleLimitChange(Number(e.target.value))}>
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {history.length === 0 && !loading ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: "center", bgcolor: "grey.50" }}>
          <History sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No Analysis History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your analysis history will appear here after you analyze some images
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {history.map((result) => (
            <Grid key={result.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <AnalysisCard result={result} onDelete={handleDelete} onShare={handleShare} compact={true} />
            </Grid>
          ))}
        </Grid>
      )}

      {loading && history.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <CircularProgress size={24} />
        </Box>
      )}
    </Box>
  );
}
