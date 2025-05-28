"use client";

import React from "react";
import { Box, Paper, Typography, Chip, IconButton, Accordion, AccordionSummary, AccordionDetails, Divider, Button } from "@mui/material";
import { ExpandMore, Delete, AccessTime, Category, Image as ImageIcon, Clear } from "@mui/icons-material";
import { ImageAnalysisResult } from "./types";

interface AnalysisResultsProps {
  results: ImageAnalysisResult[];
  onDeleteResult: (id: string) => void;
  onClearAll: () => void;
}

export default function AnalysisResults({ results, onDeleteResult, onClearAll }: AnalysisResultsProps) {
  if (results.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 4, textAlign: "center", bgcolor: "grey.50" }}>
        <ImageIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No Analysis Results Yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Upload an image and run an analysis to see results here
        </Typography>
      </Paper>
    );
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: Record<string, string> = {
      animals: "Animals & Pets",
      celebrities: "Film/TV Stars",
      movies_tv: "Movies & TV Shows",
      objects: "Objects & Items",
      locations: "Places & Locations",
      food: "Food & Cuisine",
      art: "Art & Design",
      general: "General Analysis",
    };
    return categoryMap[category] || category;
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6">Analysis Results ({results.length})</Typography>
        {results.length > 0 && (
          <Button variant="outlined" color="error" startIcon={<Clear />} onClick={onClearAll} size="small">
            Clear All
          </Button>
        )}
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {results.map((result, index) => (
          <Accordion key={result.id} defaultExpanded={index === 0}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                <img
                  src={result.imageData}
                  alt="Analyzed"
                  style={{
                    width: 60,
                    height: 60,
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1">{getCategoryDisplayName(result.category)} Analysis</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                    <AccessTime sx={{ fontSize: 16, color: "text.secondary" }} />
                    <Typography variant="caption" color="text.secondary">
                      {formatTimestamp(result.timestamp)}
                    </Typography>
                  </Box>
                </Box>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteResult(result.id);
                  }}
                  size="small"
                  color="error"
                >
                  <Delete />
                </IconButton>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Question Asked:
                  </Typography>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.50" }}>
                    <Typography variant="body2">{result.prompt}</Typography>
                  </Paper>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Analysis Result:
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                    {result.result}
                  </Typography>
                </Box>

                {result.metadata && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Details:
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        <Chip icon={<Category />} label={getCategoryDisplayName(result.category)} size="small" variant="outlined" />
                        {result.metadata.imageType && <Chip label={`Type: ${result.metadata.imageType.toUpperCase()}`} size="small" variant="outlined" />}
                        {result.metadata.imageSize && <Chip label={`Size: ${result.metadata.imageSize}`} size="small" variant="outlined" />}
                        {result.metadata.processingTime && <Chip label={`Processed in ${(result.metadata.processingTime / 1000).toFixed(1)}s`} size="small" variant="outlined" />}
                      </Box>
                    </Box>
                  </>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
}
