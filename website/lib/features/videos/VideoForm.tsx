"use client";

import React, { useState, useEffect } from "react";
import { Box, TextField, Button, Typography, Card, CardContent, Rating, Stack, Chip, IconButton, Collapse, Divider } from "@mui/material";
import { Movie, ExpandMore, ExpandLess } from "@mui/icons-material";
import { VideoFormProps, CastMember } from "./types";
import TMDbSearchDialog from "./TMDbSearchDialog";
import { tmdbService } from "@/lib/services/tmdbService";

export default function VideoForm({ video, onSubmit, onCancel, mode }: VideoFormProps) {
  const [formData, setFormData] = useState({
    title: video?.title || "",
    description: video?.description || "",
    score: video?.score || 0,
    release_date: video?.release_date || "",
    tagline: video?.tagline || "",
    runtime: video?.runtime || 0,
    genres: video?.genres || [],
    cast: video?.cast || [],
    actors: video?.actors || [],
    keywords: video?.keywords || [],
    poster_path: video?.poster_path || "",
    backdrop_path: video?.backdrop_path || "",
    production_companies: video?.production_companies || [],
    production_countries: video?.production_countries || [],
    spoken_languages: video?.spoken_languages || [],
    status: video?.status || "",
    vote_average: video?.vote_average || 0,
    vote_count: video?.vote_count || 0,
    tmdb_id: video?.tmdb_id || 0,
    imdb_id: video?.imdb_id || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTMDbDialog, setShowTMDbDialog] = useState(false);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);

  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title || "",
        description: video.description || "",
        score: video.score || 0,
        release_date: video.release_date || "",
        tagline: video.tagline || "",
        runtime: video.runtime || 0,
        genres: video.genres || [],
        cast: video.cast || [],
        actors: video.actors || [],
        keywords: video.keywords || [],
        poster_path: video.poster_path || "",
        backdrop_path: video.backdrop_path || "",
        production_companies: video.production_companies || [],
        production_countries: video.production_countries || [],
        spoken_languages: video.spoken_languages || [],
        status: video.status || "",
        vote_average: video.vote_average || 0,
        vote_count: video.vote_count || 0,
        tmdb_id: video.tmdb_id || 0,
        imdb_id: video.imdb_id || "",
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

  const handleTMDbData = (tmdbData: any) => {
    setFormData((prev) => ({
      ...prev,
      ...tmdbData,
    }));
    setShowAdvancedFields(true); // Expand to show the loaded data
  };

  const handleLoadTMDbData = () => {
    let searchTerm = formData.title;
    if (!searchTerm && video?.filename) {
      searchTerm = tmdbService.extractTitleFromFilename(video.filename);
    }
    setShowTMDbDialog(true);
  };

  const formatRuntime = (minutes: number) => {
    if (!minutes) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">{mode === "create" ? "Add Video Information" : "Edit Video Information"}</Typography>
            <Button variant="outlined" startIcon={<Movie />} onClick={handleLoadTMDbData} color="primary">
              Load TMDb Data
            </Button>
          </Box>

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

              <Box>
                <Button variant="text" onClick={() => setShowAdvancedFields(!showAdvancedFields)} startIcon={showAdvancedFields ? <ExpandLess /> : <ExpandMore />} sx={{ mb: 2 }}>
                  {showAdvancedFields ? "Hide" : "Show"} Advanced Fields
                </Button>

                <Collapse in={showAdvancedFields}>
                  <Stack spacing={2}>
                    <Divider />

                    {formData.tagline && <TextField fullWidth label="Tagline" value={formData.tagline} onChange={(e) => handleChange("tagline", e.target.value)} />}

                    {formData.runtime > 0 && <TextField label="Runtime" value={`${formData.runtime} minutes (${formatRuntime(formData.runtime)})`} InputProps={{ readOnly: true }} sx={{ width: "300px" }} />}

                    {formData.genres.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Genres
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {formData.genres.map((genre, index) => (
                            <Chip key={index} label={genre} size="small" />
                          ))}
                        </Box>
                      </Box>
                    )}

                    {formData.cast.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Cast (Top 10)
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {formData.actors && formData.actors.length > 0
                            ? formData.actors.slice(0, 10).map((actor, index) => <Chip key={index} label={actor} size="small" />)
                            : formData.cast.slice(0, 10).map((actor, index) => <Chip key={index} label={`${actor.name} as ${actor.character}`} size="small" />)}
                        </Box>
                      </Box>
                    )}

                    {formData.keywords.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Keywords
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {formData.keywords.map((keyword, index) => (
                            <Chip key={index} label={keyword} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </Box>
                    )}

                    {formData.production_companies.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Production Companies
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formData.production_companies.join(", ")}
                        </Typography>
                      </Box>
                    )}

                    {formData.tmdb_id > 0 && <TextField label="TMDb ID" value={formData.tmdb_id} InputProps={{ readOnly: true }} sx={{ width: "150px" }} />}

                    {formData.vote_average > 0 && <TextField label="TMDb Rating" value={`${formData.vote_average}/10 (${formData.vote_count} votes)`} InputProps={{ readOnly: true }} sx={{ width: "300px" }} />}
                  </Stack>
                </Collapse>
              </Box>

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

      <TMDbSearchDialog open={showTMDbDialog} onClose={() => setShowTMDbDialog(false)} onSelectMovie={handleTMDbData} initialSearchTerm={formData.title || (video?.filename ? tmdbService.extractTitleFromFilename(video.filename) : "")} />
    </>
  );
}
