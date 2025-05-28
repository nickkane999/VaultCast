"use client";

import React from "react";
import { Box, FormControl, InputLabel, Select, MenuItem, Typography, Chip, Paper } from "@mui/material";
import { AnalysisCategory } from "./types";
import IsolatedTextField from "@/lib/components/IsolatedTextField";

interface CategorySelectorProps {
  categories: AnalysisCategory[];
  selectedCategory: string;
  customPrompt: string;
  onCategoryChange: (category: string) => void;
  onCustomPromptChange: (prompt: string) => void;
}

export default function CategorySelector({ categories, selectedCategory, customPrompt, onCategoryChange, onCustomPromptChange }: CategorySelectorProps) {
  const currentCategory = categories.find((cat) => cat.id === selectedCategory);

  const handlePromptClick = (prompt: string) => {
    onCustomPromptChange(prompt);
  };

  return (
    <Box>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Analysis Category</InputLabel>
        <Select value={selectedCategory} label="Analysis Category" onChange={(e) => onCategoryChange(e.target.value)}>
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              <Box>
                <Typography variant="body1">{category.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {category.description}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {currentCategory && (
        <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: "grey.50" }}>
          <Typography variant="subtitle2" gutterBottom>
            Suggested Questions for {currentCategory.name}:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {currentCategory.prompts.map((prompt, index) => (
              <Chip
                key={index}
                label={prompt}
                variant="outlined"
                clickable
                onClick={() => handlePromptClick(prompt)}
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "primary.light",
                    color: "primary.contrastText",
                  },
                }}
              />
            ))}
          </Box>
        </Paper>
      )}

      <IsolatedTextField fullWidth multiline rows={3} label="Custom Question (Optional)" value={customPrompt} onDebouncedChange={onCustomPromptChange} placeholder="Ask a specific question about the image..." helperText="Leave empty to use the default question for the selected category" />
    </Box>
  );
}
