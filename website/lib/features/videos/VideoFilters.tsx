"use client";

import React, { useState, useEffect } from "react";
import { Box, FormControl, InputLabel, Select, MenuItem, Typography, Chip, Button, Card, CardContent, Collapse, IconButton, Autocomplete, TextField } from "@mui/material";
import { FilterList, ExpandMore, ExpandLess, Clear, Update } from "@mui/icons-material";
import { useSearchParams } from "next/navigation";

interface VideoFiltersProps {
  filters: {
    year: string | null;
    actor: string[] | null;
    genre: string[] | null;
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
  onBatchFilterUpdate: (filters: { year?: string | null; actor?: string[] | null; genre?: string[] | null; runtimeMin?: number | null; runtimeMax?: number | null; ratingMin?: number | null; ratingMax?: number | null }) => void;
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
  { label: "All", min: null, max: null, value: "All" },
  { label: "Short (0-30 min)", min: 0, max: 30, value: "short" },
  { label: "Medium (30-60 min)", min: 30, max: 60, value: "medium" },
  { label: "Long (60-120 min)", min: 60, max: 120, value: "long" },
  { label: "Very Long (120+ min)", min: 120, max: null, value: "very-long" },
];

const ratingRanges: RatingRange[] = [
  { label: "All", min: null, max: null, value: "All" },
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
    const urlRuntimeMin = searchParams.get("runtimeMin");
    const urlRuntimeMax = searchParams.get("runtimeMax");
    const urlRatingMin = searchParams.get("ratingMin");
    const urlRatingMax = searchParams.get("ratingMax");

    // 'arse runtime values, treating null/undefined a' null, bu' preserving 0 as valid
    const runtimeMin = urlRuntimeMin !== null ? parseInt(urlRuntimeMin) : null;
    const runtimeMax = urlRuntimeMax !== null ? parseInt(urlRuntimeMax) : null;
    const ratingMin = urlRatingMin !== null ? parseFloat(urlRatingMin) : null;
    const ratingMax = urlRatingMax !== null ? parseFloat(urlRatingMax) : null;

    const currentRuntimeRange = runtimeRanges.find((range) => range.min === runtimeMin && range.max === runtimeMax);
    const currentRatingRange = ratingRanges.find((range) => range.min === ratingMin && range.max === ratingMax);

    return {
      year: urlYear || "All",
      actor: urlActor ? urlActor.split(",") : null,
      genre: urlGenre ? urlGenre.split(",") : null,
      runtime: currentRuntimeRange?.value || "All",
      rating: currentRatingRange?.value || "All",
    };
  };

  const [localFilters, setLocalFilters] = useState(getCurrentURLFilters);

  // Update local filters when URL changes
  useEffect(() => {
    setLocalFilters(getCurrentURLFilters());
  }, [searchParams]);

  const hasActiveFilters = filters.year !== null || (filters.actor !== null && filters.actor.length > 0) || (filters.genre !== null && filters.genre.length > 0) || filters.runtimeMin !== null || filters.runtimeMax !== null || filters.ratingMin !== null || filters.ratingMax !== null;

  const activeFiltersCount = [
    filters.year,
    filters.actor && filters.actor.length > 0 ? filters.actor : null,
    filters.genre && filters.genre.length > 0 ? filters.genre : null,
    filters.runtimeMin !== null || filters.runtimeMax !== null ? "runtime" : null,
    filters.ratingMin !== null || filters.ratingMax !== null ? "rating" : null,
  ].filter(Boolean).length;

  const hasLocalChanges = () => {
    const urlFilters = getCurrentURLFilters();

    const localYear = localFilters.year === "" || localFilters.year === "All" ? null : localFilters.year;
    const localActor = localFilters.actor ? localFilters.actor.join(",") : null;
    const localGenre = localFilters.genre ? localFilters.genre.join(",") : null;

    const urlYear = urlFilters.year === "All" ? null : urlFilters.year;
    const urlActor = urlFilters.actor ? urlFilters.actor.join(",") : null;
    const urlGenre = urlFilters.genre ? urlFilters.genre.join(",") : null;

    return localYear !== urlYear || localActor !== urlActor || localGenre !== urlGenre || localFilters.runtime !== urlFilters.runtime || localFilters.rating !== urlFilters.rating;
  };

  const handleLocalFilterChange = (filterType: string, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const handleUpdateFilters = () => {
    const selectedRuntimeRange = runtimeRanges.find((range) => range.value === localFilters.runtime);
    const selectedRatingRange = ratingRanges.find((range) => range.value === localFilters.rating);

    onBatchFilterUpdate({
      year: localFilters.year === "" || localFilters.year === "All" ? null : localFilters.year,
      actor: localFilters.actor ? localFilters.actor.map((a) => a) : null,
      genre: localFilters.genre ? localFilters.genre.map((g) => g) : null,
      runtimeMin: selectedRuntimeRange?.min ?? null,
      runtimeMax: selectedRuntimeRange?.max ?? null,
      ratingMin: selectedRatingRange?.min ?? null,
      ratingMax: selectedRatingRange?.max ?? null,
    });
  };

  const handleClearLocalFilters = () => {
    setLocalFilters({
      year: "",
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
                <Select value={localFilters.year || "All Years"} onChange={(e) => handleLocalFilterChange("year", e.target.value || null)} label="Year">
                  <MenuItem value="All">All</MenuItem>
                  {filterOptions.years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <Autocomplete multiple value={localFilters.actor || []} onChange={(event, newValue) => handleLocalFilterChange("actor", newValue)} options={filterOptions.actors} renderInput={(params) => <TextField {...params} label="Actor" />} />
              </FormControl>

              <FormControl fullWidth size="small">
                <Autocomplete multiple value={localFilters.genre || []} onChange={(event, newValue) => handleLocalFilterChange("genre", newValue)} options={filterOptions.genres} renderInput={(params) => <TextField {...params} label="Genre" />} />
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
                  {filters.actor && <Chip size="small" label={`Actor: ${filters.actor.join(", ")}`} onDelete={() => onFilterChange("actor", null)} color="primary" variant="outlined" />}
                  {filters.genre && <Chip size="small" label={`Genre: ${filters.genre.join(", ")}`} onDelete={() => onFilterChange("genre", null)} color="primary" variant="outlined" />}
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
