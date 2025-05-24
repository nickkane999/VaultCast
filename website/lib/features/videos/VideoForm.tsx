"use client";

import React, { useState, useEffect } from "react";
import { Box, TextField, Button, Typography, Card, CardContent, Rating, Stack } from "@mui/material";
import { VideoFormProps } from "./types";

export default function VideoForm({ video, onSubmit, onCancel, mode }: VideoFormProps) {
  const [formData, setFormData] = useState({
    title: video?.title || "",
    description: video?.description || "",
    score: video?.score || 0,
    release_date: video?.release_date || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title || "",
        description: video.description || "",
        score: video.score || 0,
        release_date: video.release_date || "",
      });
    }
  }, [video]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (formData.score < 0 || formData.score > 10) {
      newErrors.score = "Score must be between 0 and 10";
    }

    if (!formData.release_date) {
      newErrors.release_date = "Release date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {mode === "create" ? "Add Video Information" : "Edit Video Information"}
        </Typography>

        {video && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            File: {video.filename}
          </Typography>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Stack spacing={2}>
            <TextField fullWidth label="Title" value={formData.title} onChange={(e) => handleChange("title", e.target.value)} error={!!errors.title} helperText={errors.title} required />

            <TextField fullWidth label="Description" value={formData.description} onChange={(e) => handleChange("description", e.target.value)} error={!!errors.description} helperText={errors.description} multiline rows={3} required />

            <Box>
              <Typography component="legend">Score</Typography>
              <Rating
                name="score"
                value={formData.score}
                onChange={(event, newValue) => {
                  handleChange("score", newValue || 0);
                }}
                max={10}
                precision={0.5}
              />
              <TextField type="number" label="Score (0-10)" value={formData.score} onChange={(e) => handleChange("score", parseFloat(e.target.value) || 0)} error={!!errors.score} helperText={errors.score} inputProps={{ min: 0, max: 10, step: 0.1 }} sx={{ mt: 1, width: "150px" }} />
            </Box>

            <TextField
              label="Release Date"
              type="date"
              value={formData.release_date}
              onChange={(e) => handleChange("release_date", e.target.value)}
              error={!!errors.release_date}
              helperText={errors.release_date}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ width: "200px" }}
              required
            />

            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              <Button type="button" onClick={onCancel} variant="outlined">
                Cancel
              </Button>
              <Button type="submit" variant="contained">
                {mode === "create" ? "Create" : "Update"}
              </Button>
            </Box>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
