"use client";

import React, { useState, useEffect } from "react";
import { Box, FormControl, InputLabel, Select, MenuItem, Typography, Chip, Button, Card, CardContent, Collapse, IconButton, Autocomplete, TextField } from "@mui/material";
import { FilterList, ExpandMore, ExpandLess, Clear, Update } from "@mui/icons-material";
import { useSearchParams } from "next/navigation";

interface VideoFiltersProps {
  filters: {
    year: string | null;
    actor: string | null;
    genre: string | null;
    runtimeMin: number | null;
    runtimeMax: number | null;
    ratingMin: number | null;
    ratingMax: number | null;
  };
  filterOptions: {
    actors: string[];
    genres: string[];
    years: string[];
  };
  onFilterChange: (filterType: string, value: any) => void;
  onBatchFilterUpdate: (filters: { year?: string | null; actor?: string | null; genre?: string | null; runtimeMin?: number | null; runtimeMax?: number | null; ratingMin?: number | null; ratingMax?: number | null }) => void;
  onClearFilters: () => void;
}

interface RuntimeRange {
  label: string;
  min: number | null;
  max: number | null;
  value: string;
}

interface RatingRange {
  label: string;
  min: number | null;
  max: number | null;
  value: string;
}

const runtimeRanges: RuntimeRange[] = [
  { label: "All Durations", min: null, max: null, value: "" },
  { label: "Short (0-30 min)", min: 0, max: 30, value: "short" },
  { label: "Medium (30-60 min)", min: 30, max: 60, value: "medium" },
  { label: "Long (60-120 min)", min: 60, max: 120, value: "long" },
  { label: "Very Long (120+ min)", min: 120, max: null, value: "very-long" },
];

const ratingRanges: RatingRange[] = [
  { label: "All Ratings", min: null, max: null, value: "" },
  { label: "Bad (0-5)", min: 0, max: 5, value: "bad" },
  { label: "Ok (5-7)", min: 5, max: 7, value: "ok" },
  { label: "Good (7-9)", min: 7, max: 9, value: "good" },
  { label: "Great (9-10)", min: 9, max: 10, value: "great" },
];

export default function VideoFilters({ filters, filterOptions, onFilterChange, onBatchFilterUpdate, onClearFilters }: VideoFiltersProps) {
  const [expanded, setExpanded] = useState(false);
  const searchParams = useSearchParams();

  // Get current URL filters to initialize local state and check for changes
  const getCurrentURLFilters = () => {
    const urlYear = searchParams.get("year");
    const urlActor = searchParams.get("actor");
    const urlGenre = searchParams.get("genre");
    const urlRuntimeMin = searchParams.get("runtimeMin") ? parseInt(searchParams.get("runtimeMin")!) : null;
    const urlRuntimeMax = searchParams.get("runtimeMax") ? parseInt(searchParams.get("runtimeMax")!) : null;
    const urlRatingMin = searchParams.get("ratingMin") ? parseFloat(searchParams.get("ratingMin")!) : null;
    const urlRatingMax = searchParams.get("ratingMax") ? parseFloat(searchParams.get("ratingMax")!) : null;

    const currentRuntimeRange = runtimeRanges.find((range) => range.min === urlRuntimeMin && range.max === urlRuntimeMax);
    const currentRatingRange = ratingRanges.find((range) => range.min === urlRatingMin && range.max === urlRatingMax);

    return {
      year: urlYear,
      actor: urlActor,
      genre: urlGenre,
      runtime: currentRuntimeRange?.value || "",
      rating: currentRatingRange?.value || "",
    };
  };

  const [localFilters, setLocalFilters] = useState(getCurrentURLFilters);

  // Update local filters when URL changes
  useEffect(() => {
    setLocalFilters(getCurrentURLFilters());
  }, [searchParams]);

  const hasActiveFilters = Object.values(filters).some((value) => value !== null && value !== "");
  const activeFiltersCount = Object.values(filters).filter((value) => value !== null && value !== "").length;

  const hasLocalChanges = () => {
    const urlFilters = getCurrentURLFilters();
    return localFilters.year !== urlFilters.year || localFilters.actor !== urlFilters.actor || localFilters.genre !== urlFilters.genre || localFilters.runtime !== urlFilters.runtime || localFilters.rating !== urlFilters.rating;
  };

  const handleLocalFilterChange = (filterType: string, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const handleUpdateFilters = () => {
    const selectedRuntimeRange = runtimeRanges.find((range) => range.value === localFilters.runtime);
    const selectedRatingRange = ratingRanges.find((range) => range.value === localFilters.rating);

    onBatchFilterUpdate({
      year: localFilters.year || null,
      actor: localFilters.actor || null,
      genre: localFilters.genre || null,
      runtimeMin: selectedRuntimeRange?.min || null,
      runtimeMax: selectedRuntimeRange?.max || null,
      ratingMin: selectedRatingRange?.min || null,
      ratingMax: selectedRatingRange?.max || null,
    });
  };

  const handleClearLocalFilters = () => {
    setLocalFilters({
      year: null,
      actor: null,
      genre: null,
      runtime: "",
      rating: "",
    });
    onClearFilters();
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FilterList />
            <Typography variant="h6">
              Filters
              {activeFiltersCount > 0 && <Chip size="small" label={activeFiltersCount} color="primary" sx={{ ml: 1 }} />}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {hasActiveFilters && (
              <Button size="small" startIcon={<Clear />} onClick={handleClearLocalFilters} variant="outlined">
                Clear All
              </Button>
            )}
            <IconButton onClick={() => setExpanded(!expanded)} size="small">
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr 1fr" },
                gap: 2,
                mb: 2,
              }}
            >
              <FormControl fullWidth size="small">
                <InputLabel>Year</InputLabel>
                <Select value={localFilters.year || ""} onChange={(e) => handleLocalFilterChange("year", e.target.value || null)} label="Year">
                  <MenuItem value="">All Years</MenuItem>
                  {filterOptions.years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Actor</InputLabel>
                <Select value={localFilters.actor || ""} onChange={(e) => handleLocalFilterChange("actor", e.target.value || null)} label="Actor">
                  <MenuItem value="">All Actors</MenuItem>
                  {filterOptions.actors.map((actor) => (
                    <MenuItem key={actor} value={actor}>
                      {actor}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Genre</InputLabel>
                <Select value={localFilters.genre || ""} onChange={(e) => handleLocalFilterChange("genre", e.target.value || null)} label="Genre">
                  <MenuItem value="">All Genres</MenuItem>
                  {filterOptions.genres.map((genre) => (
                    <MenuItem key={genre} value={genre}>
                      {genre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Runtime</InputLabel>
                <Select value={localFilters.runtime} onChange={(e) => handleLocalFilterChange("runtime", e.target.value)} label="Runtime">
                  {runtimeRanges.map((range) => (
                    <MenuItem key={range.value} value={range.value}>
                      {range.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Rating</InputLabel>
                <Select value={localFilters.rating} onChange={(e) => handleLocalFilterChange("rating", e.target.value)} label="Rating">
                  {ratingRanges.map((range) => (
                    <MenuItem key={range.value} value={range.value}>
                      {range.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <Button variant="contained" startIcon={<Update />} onClick={handleUpdateFilters} disabled={!hasLocalChanges()} color="primary">
                Update Results
              </Button>
            </Box>

            {hasActiveFilters && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Active Filters:
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {filters.year && <Chip size="small" label={`Year: ${filters.year}`} onDelete={() => onFilterChange("year", null)} color="primary" variant="outlined" />}
                  {filters.actor && <Chip size="small" label={`Actor: ${filters.actor}`} onDelete={() => onFilterChange("actor", null)} color="primary" variant="outlined" />}
                  {filters.genre && <Chip size="small" label={`Genre: ${filters.genre}`} onDelete={() => onFilterChange("genre", null)} color="primary" variant="outlined" />}
                  {(filters.runtimeMin !== null || filters.runtimeMax !== null) && (
                    <Chip
                      size="small"
                      label={`Runtime: ${runtimeRanges.find((r) => r.min === filters.runtimeMin && r.max === filters.runtimeMax)?.label || `${filters.runtimeMin || 0}-${filters.runtimeMax || "∞"} min`}`}
                      onDelete={() => {
                        onFilterChange("runtimeMin", null);
                        onFilterChange("runtimeMax", null);
                      }}
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {(filters.ratingMin !== null || filters.ratingMax !== null) && (
                    <Chip
                      size="small"
                      label={`Rating: ${ratingRanges.find((r) => r.min === filters.ratingMin && r.max === filters.ratingMax)?.label || `${filters.ratingMin || 0}-${filters.ratingMax || 10}`}`}
                      onDelete={() => {
                        onFilterChange("ratingMin", null);
                        onFilterChange("ratingMax", null);
                      }}
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}
