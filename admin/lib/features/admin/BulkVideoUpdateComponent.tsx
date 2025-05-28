"use client";

import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Card, CardContent, LinearProgress, Alert, Chip, List, ListItem, ListItemText, Divider, FormControlLabel, Checkbox, TextField, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { Update, Movie, Refresh, Tv } from "@mui/icons-material";

interface BulkUpdateProgress {
  total: number;
  current: number;
  currentMovie: string;
  completed: string[];
  failed: string[];
  skipped: string[];
}

interface BulkUpdateOptions {
  updateTrailers: boolean;
  updateMissingInfo: boolean;
  overwriteExisting: boolean;
  batchSize: number;
  contentType: "movies" | "tv";
  selectedShow?: string;
  selectedSeason?: number;
  showStatus?: "all" | "recorded" | "unrecorded";
}

interface TVShow {
  name: string;
  seasons: Array<{
    seasonNumber: number;
    episodeCount: number;
    recordedCount?: number;
    status?: "complete" | "partial" | "none";
  }>;
  status?: "complete" | "partial" | "none";
}

interface TVShowStatus {
  recordedShows: TVShow[];
  unrecordedShows: TVShow[];
  summary: {
    totalShows: number;
    recordedShows: number;
    unrecordedShows: number;
    completeShows: number;
    partialShows: number;
  };
}

export default function BulkVideoUpdateComponent() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState<BulkUpdateProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [options, setOptions] = useState<BulkUpdateOptions>({
    updateTrailers: true,
    updateMissingInfo: true,
    overwriteExisting: false,
    batchSize: 5,
    contentType: "movies",
    showStatus: "all",
  });
  const [tvShows, setTvShows] = useState<TVShow[]>([]);
  const [tvShowStatus, setTvShowStatus] = useState<TVShowStatus | null>(null);
  const [loadingShows, setLoadingShows] = useState(false);

  // Fetch available TV shows when component mounts or when switching to TV mode
  useEffect(() => {
    if (options.contentType === "tv") {
      fetchTVShows();
    }
  }, [options.contentType]);

  const fetchTVShows = async () => {
    setLoadingShows(true);
    try {
      const [statusResponse, showsResponse] = await Promise.all([fetch("/api/admin/tv-show-status"), fetch("/api/admin/scan-tv-shows")]);

      if (statusResponse.ok && showsResponse.ok) {
        const statusData = await statusResponse.json();
        const showsData = await showsResponse.json();

        setTvShowStatus(statusData);
        setTvShows(showsData.shows || []);
      } else {
        console.error("Failed to fetch TV shows");
      }
    } catch (error) {
      console.error("Error fetching TV shows:", error);
    } finally {
      setLoadingShows(false);
    }
  };

  const handleBulkUpdate = async () => {
    setIsUpdating(true);
    setError(null);
    setSuccess(null);
    setProgress(null);

    try {
      const response = await fetch("/api/admin/bulk-update-videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              if (data.type === "progress") {
                setProgress(data.data);
              } else if (data.type === "complete") {
                setSuccess(`Bulk update completed! Updated ${data.data.updated} videos, skipped ${data.data.skipped}, failed ${data.data.failed}.`);
              } else if (data.type === "error") {
                setError(data.message);
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during bulk update");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOptionChange = (option: keyof BulkUpdateOptions, value: boolean | number | string) => {
    setOptions((prev) => {
      const newOptions = { ...prev, [option]: value };

      // Reset TV-specific options when switching content types
      if (option === "contentType") {
        newOptions.selectedShow = undefined;
        newOptions.selectedSeason = undefined;
        newOptions.showStatus = "all";
      }

      // Reset season when changing show
      if (option === "selectedShow") {
        newOptions.selectedSeason = undefined;
      }

      // Reset show and season when changing show status
      if (option === "showStatus") {
        newOptions.selectedShow = undefined;
        newOptions.selectedSeason = undefined;
      }

      return newOptions;
    });
  };

  // Get filtered shows based on status
  const getFilteredShows = () => {
    if (!tvShowStatus) return tvShows;

    switch (options.showStatus) {
      case "recorded":
        return tvShowStatus.recordedShows;
      case "unrecorded":
        return tvShowStatus.unrecordedShows;
      default:
        return [...tvShowStatus.recordedShows, ...tvShowStatus.unrecordedShows].sort((a, b) => a.name.localeCompare(b.name));
    }
  };

  // Get available seasons for selected show
  const getAvailableSeasons = () => {
    if (!options.selectedShow) return [];
    const filteredShows = getFilteredShows();
    const show = filteredShows.find((s) => s.name === options.selectedShow);
    return show?.seasons || [];
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          {options.contentType === "movies" ? <Movie color="primary" /> : <Tv color="primary" />}
          <Typography variant="h6">Bulk Video Update</Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {options.contentType === "movies" ? "Update all movie records with missing information from TMDb, including trailers, cast, genres, and other metadata." : "Update TV show episodes with episode-specific information from TMDb, including episode titles, descriptions, air dates, and cast."}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Content Type
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Content Type</InputLabel>
            <Select value={options.contentType} label="Content Type" onChange={(e) => handleOptionChange("contentType", e.target.value)}>
              <MenuItem value="movies">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Movie fontSize="small" />
                  Movies
                </Box>
              </MenuItem>
              <MenuItem value="tv">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Tv fontSize="small" />
                  TV Shows
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {options.contentType === "tv" && (
            <Box sx={{ mb: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Show Status</InputLabel>
                <Select value={options.showStatus || "all"} label="Show Status" onChange={(e) => handleOptionChange("showStatus", e.target.value)}>
                  <MenuItem value="all">All Shows</MenuItem>
                  <MenuItem value="unrecorded">Unrecorded Shows {tvShowStatus && `(${tvShowStatus.unrecordedShows.length})`}</MenuItem>
                  <MenuItem value="recorded">Recorded Shows {tvShowStatus && `(${tvShowStatus.recordedShows.length})`}</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select TV Show</InputLabel>
                <Select value={options.selectedShow || ""} label="Select TV Show" onChange={(e) => handleOptionChange("selectedShow", e.target.value)} disabled={loadingShows}>
                  <MenuItem value="">
                    <em>All {options.showStatus === "all" ? "TV Shows" : options.showStatus === "recorded" ? "Recorded Shows" : "Unrecorded Shows"}</em>
                  </MenuItem>
                  {getFilteredShows().map((show) => (
                    <MenuItem key={show.name} value={show.name}>
                      {show.name} ({show.seasons.length} season{show.seasons.length !== 1 ? "s" : ""}){show.status && <span style={{ marginLeft: 8, fontSize: "0.8em", opacity: 0.7 }}>{show.status === "complete" ? "✓" : show.status === "partial" ? "⚠" : "○"}</span>}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {options.selectedShow && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Select Season</InputLabel>
                  <Select value={options.selectedSeason?.toString() || ""} label="Select Season" onChange={(e) => handleOptionChange("selectedSeason", parseInt(e.target.value as string))}>
                    <MenuItem value="">
                      <em>All Seasons</em>
                    </MenuItem>
                    {getAvailableSeasons().map((season) => (
                      <MenuItem key={season.seasonNumber} value={season.seasonNumber.toString()}>
                        Season {season.seasonNumber} ({season.episodeCount} episode{season.episodeCount !== 1 ? "s" : ""})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {tvShowStatus && (
                <Box sx={{ mb: 2, p: 2, bgcolor: "background.paper", borderRadius: 1, border: "1px solid #e0e0e0" }}>
                  <Typography variant="subtitle2" gutterBottom>
                    TV Show Summary
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Shows: {tvShowStatus.summary.totalShows} | Unrecorded: {tvShowStatus.summary.unrecordedShows} | Recorded: {tvShowStatus.summary.recordedShows}({tvShowStatus.summary.completeShows} complete, {tvShowStatus.summary.partialShows} partial)
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          <Typography variant="subtitle2" gutterBottom>
            Update Options
          </Typography>
          <FormControlLabel control={<Checkbox checked={options.updateTrailers} onChange={(e) => handleOptionChange("updateTrailers", e.target.checked)} />} label="Update trailer URLs" />
          <FormControlLabel control={<Checkbox checked={options.updateMissingInfo} onChange={(e) => handleOptionChange("updateMissingInfo", e.target.checked)} />} label="Update missing information (cast, genres, etc.)" />
          <FormControlLabel control={<Checkbox checked={options.overwriteExisting} onChange={(e) => handleOptionChange("overwriteExisting", e.target.checked)} />} label="Overwrite existing information" />
          <TextField label="Batch Size" type="number" value={options.batchSize} onChange={(e) => handleOptionChange("batchSize", parseInt(e.target.value) || 5)} inputProps={{ min: 1, max: 20 }} size="small" sx={{ ml: 2, width: 120 }} />
        </Box>

        {progress && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Progress: {progress.current} / {progress.total}
            </Typography>
            <LinearProgress variant="determinate" value={(progress.current / progress.total) * 100} sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Currently processing: {progress.currentMovie}
            </Typography>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
              <Chip label={`Completed: ${progress.completed.length}`} color="success" size="small" />
              <Chip label={`Failed: ${progress.failed.length}`} color="error" size="small" />
              <Chip label={`Skipped: ${progress.skipped.length}`} color="default" size="small" />
            </Box>

            {(progress.failed.length > 0 || progress.completed.length > 0) && (
              <Box sx={{ maxHeight: 200, overflow: "auto" }}>
                {progress.completed.length > 0 && (
                  <>
                    <Typography variant="caption" color="success.main">
                      Recently Completed:
                    </Typography>
                    <List dense>
                      {progress.completed.slice(-5).map((movie, index) => (
                        <ListItem key={index} sx={{ py: 0 }}>
                          <ListItemText primary={movie} primaryTypographyProps={{ variant: "caption" }} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}

                {progress.failed.length > 0 && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" color="error.main">
                      Failed:
                    </Typography>
                    <List dense>
                      {progress.failed.map((movie, index) => (
                        <ListItem key={index} sx={{ py: 0 }}>
                          <ListItemText primary={movie} primaryTypographyProps={{ variant: "caption" }} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </Box>
            )}
          </Box>
        )}

        <Button variant="contained" startIcon={isUpdating ? <Refresh className="animate-spin" /> : <Update />} onClick={handleBulkUpdate} disabled={isUpdating} fullWidth>
          {isUpdating ? "Updating Videos..." : "Start Bulk Update"}
        </Button>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
          This process will search for each video on TMDb and update missing information. It may take several minutes depending on the number of videos.
        </Typography>
      </CardContent>
    </Card>
  );
}
