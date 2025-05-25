"use client";

import React, { useState } from "react";
import { Box, Button, Typography, Card, CardContent, LinearProgress, Alert, Chip, List, ListItem, ListItemText, Divider, FormControlLabel, Checkbox, TextField } from "@mui/material";
import { Update, Movie, Refresh } from "@mui/icons-material";

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
  });

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

  const handleOptionChange = (option: keyof BulkUpdateOptions, value: boolean | number) => {
    setOptions((prev) => ({ ...prev, [option]: value }));
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Movie color="primary" />
          <Typography variant="h6">Bulk Video Update</Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Update all video records with missing information from TMDb, including trailers, cast, genres, and other metadata.
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
