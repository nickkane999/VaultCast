"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchMovies,
  createMovieRecord,
  updateMovieRecord,
  deleteMovieRecord,
  setCurrentPage,
  setSearchQuery,
  setSortBy,
  setSortOrder,
  setShowCreateForm,
  setEditingMovieId,
  updateEditForm,
  clearEditForm,
  setYearFilter,
  setActorFilter,
  setGenreFilter,
  setRuntimeFilter,
  setRatingFilter,
  setShowUnrecordedFilter,
} from "@/store/moviesSlice";
import { Box, Card, CardContent, CardMedia, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Pagination, FormControl, InputLabel, Select, MenuItem, Chip, CircularProgress, Alert, Paper, Rating, Collapse, IconButton } from "@mui/material";
import { Add, Edit, Delete, Search, Movie, ExpandMore, ExpandLess } from "@mui/icons-material";
import IsolatedTextField from "@/lib/components/IsolatedTextField";
import VideoForm from "@/lib/features/videos/VideoForm";
import VideoFilters from "@/lib/features/videos/VideoFilters";
import { useRouter, useSearchParams } from "next/navigation";

export default function MoviesClient() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Memoized selectors for specific state pieces
  const movies = useSelector((state: RootState) => state.movies.movies);
  const currentPage = useSelector((state: RootState) => state.movies.currentPage);
  const totalMovies = useSelector((state: RootState) => state.movies.totalMovies);
  const moviesPerPage = useSelector((state: RootState) => state.movies.moviesPerPage);
  const loading = useSelector((state: RootState) => state.movies.loading);
  const error = useSelector((state: RootState) => state.movies.error);
  const editingMovieId = useSelector((state: RootState) => state.movies.editingMovieId);
  const editForm = useSelector((state: RootState) => state.movies.editForm);
  const searchQuery = useSelector((state: RootState) => state.movies.searchQuery);
  const sortBy = useSelector((state: RootState) => state.movies.sortBy);
  const sortOrder = useSelector((state: RootState) => state.movies.sortOrder);
  const yearFilter = useSelector((state: RootState) => state.movies.yearFilter);
  const actorFilter = useSelector((state: RootState) => state.movies.actorFilter);
  const genreFilter = useSelector((state: RootState) => state.movies.genreFilter);
  const runtimeFilter = useSelector((state: RootState) => state.movies.runtimeFilter);
  const ratingFilter = useSelector((state: RootState) => state.movies.ratingFilter);
  const showUnrecordedFilter = useSelector((state: RootState) => state.movies.showUnrecordedFilter);
  const filterOptions = useSelector((state: RootState) => state.movies.filterOptions);

  // Local state for advanced info
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [urlSyncInitialized, setUrlSyncInitialized] = useState(false);

  // Create filters object from Redux state
  const filters = {
    year: yearFilter,
    actor: actorFilter,
    genre: genreFilter,
    runtimeMin: runtimeFilter.min,
    runtimeMax: runtimeFilter.max,
    ratingMin: ratingFilter.min,
    ratingMax: ratingFilter.max,
    showUnrecorded: showUnrecordedFilter,
  };

  // Initialize filters from URL on component mount
  useEffect(() => {
    if (!urlSyncInitialized) {
      const urlPage = searchParams.get("page");
      const urlYear = searchParams.get("year");
      const urlActor = searchParams.get("actor");
      const urlGenre = searchParams.get("genre");
      const urlSearch = searchParams.get("search");
      const urlSortBy = searchParams.get("sortBy");
      const urlSortOrder = searchParams.get("sortOrder");
      const urlRatingMin = searchParams.get("ratingMin");
      const urlRatingMax = searchParams.get("ratingMax");
      const urlRuntimeMin = searchParams.get("runtimeMin");
      const urlRuntimeMax = searchParams.get("runtimeMax");
      const urlShowUnrecorded = searchParams.get("showUnrecorded");

      if (urlPage && parseInt(urlPage) !== currentPage) {
        dispatch(setCurrentPage(parseInt(urlPage)));
      }
      if (urlYear && urlYear !== yearFilter) {
        dispatch(setYearFilter(urlYear));
      }
      if (urlActor) {
        const actors = urlActor.split(",").map((a) => a.trim());
        dispatch(setActorFilter(actors));
      }
      if (urlGenre) {
        const genres = urlGenre.split(",").map((g) => g.trim());
        dispatch(setGenreFilter(genres));
      }
      if (urlSearch && urlSearch !== searchQuery) {
        dispatch(setSearchQuery(urlSearch));
      }
      if (urlSortBy && (urlSortBy === "rank" || urlSortBy === "release_date") && urlSortBy !== sortBy) {
        dispatch(setSortBy(urlSortBy));
      }
      if (urlSortOrder && (urlSortOrder === "asc" || urlSortOrder === "desc") && urlSortOrder !== sortOrder) {
        dispatch(setSortOrder(urlSortOrder));
      }
      if (urlRatingMin || urlRatingMax) {
        dispatch(
          setRatingFilter({
            min: urlRatingMin ? parseFloat(urlRatingMin) : null,
            max: urlRatingMax ? parseFloat(urlRatingMax) : null,
          })
        );
      }
      if (urlRuntimeMin || urlRuntimeMax) {
        dispatch(
          setRuntimeFilter({
            min: urlRuntimeMin ? parseInt(urlRuntimeMin) : null,
            max: urlRuntimeMax ? parseInt(urlRuntimeMax) : null,
          })
        );
      }
      if (urlShowUnrecorded && urlShowUnrecorded !== (showUnrecordedFilter ? "true" : "false")) {
        dispatch(setShowUnrecordedFilter(urlShowUnrecorded === "true"));
      }

      setUrlSyncInitialized(true);
    }
  }, [searchParams, dispatch, urlSyncInitialized, currentPage, yearFilter, actorFilter, genreFilter, searchQuery, sortBy, sortOrder, ratingFilter, runtimeFilter, showUnrecordedFilter]);

  // Update URL when filters change (after initial sync)
  useEffect(() => {
    if (urlSyncInitialized) {
      const params = new URLSearchParams(searchParams.toString());

      // Update or remove parameters based on current state
      if (currentPage > 1) {
        params.set("page", currentPage.toString());
      } else {
        params.delete("page");
      }

      if (yearFilter) {
        params.set("year", yearFilter);
      } else {
        params.delete("year");
      }

      if (actorFilter && actorFilter.length > 0) {
        params.set("actor", actorFilter.join(","));
      } else {
        params.delete("actor");
      }

      if (genreFilter && genreFilter.length > 0) {
        params.set("genre", genreFilter.join(","));
      } else {
        params.delete("genre");
      }

      if (searchQuery) {
        params.set("search", searchQuery);
      } else {
        params.delete("search");
      }

      if (sortBy !== "release_date") {
        params.set("sortBy", sortBy);
      } else {
        params.delete("sortBy");
      }

      if (sortOrder !== "desc") {
        params.set("sortOrder", sortOrder);
      } else {
        params.delete("sortOrder");
      }

      if (ratingFilter.min !== null) {
        params.set("ratingMin", ratingFilter.min.toString());
      } else {
        params.delete("ratingMin");
      }

      if (ratingFilter.max !== null) {
        params.set("ratingMax", ratingFilter.max.toString());
      } else {
        params.delete("ratingMax");
      }

      if (runtimeFilter.min !== null) {
        params.set("runtimeMin", runtimeFilter.min.toString());
      } else {
        params.delete("runtimeMin");
      }

      if (runtimeFilter.max !== null) {
        params.set("runtimeMax", runtimeFilter.max.toString());
      } else {
        params.delete("runtimeMax");
      }

      if (showUnrecordedFilter !== null) {
        params.set("showUnrecorded", showUnrecordedFilter.toString());
      } else {
        params.delete("showUnrecorded");
      }

      const newUrl = `/videos?${params.toString()}`;
      if (newUrl !== `/videos?${searchParams.toString()}`) {
        router.replace(newUrl);
      }
    }
  }, [urlSyncInitialized, currentPage, yearFilter, actorFilter, genreFilter, searchQuery, sortBy, sortOrder, ratingFilter, runtimeFilter, showUnrecordedFilter, router, searchParams]);

  // Fetch movies on component mount and when filters change
  useEffect(() => {
    if (urlSyncInitialized) {
      dispatch(
        fetchMovies({
          page: 1, // Always fetch from page 1
          limit: 1000, // Fetch a large number to get all movies for client-side pagination
          searchQuery: searchQuery || undefined,
          sortBy,
          sortOrder,
          yearFilter: yearFilter || undefined,
          actorFilter: actorFilter || undefined,
          genreFilter: genreFilter || undefined,
          runtimeMin: runtimeFilter.min || undefined,
          runtimeMax: runtimeFilter.max || undefined,
          ratingMin: ratingFilter.min || undefined,
          ratingMax: ratingFilter.max || undefined,
          showUnrecorded: showUnrecordedFilter || undefined,
        })
      );
    }
  }, [dispatch, urlSyncInitialized, searchQuery, sortBy, sortOrder, yearFilter, actorFilter, genreFilter, runtimeFilter, ratingFilter, showUnrecordedFilter]);

  // Debounced handlers for isolated text fields
  const handleDebouncedSearchChange = (value: string) => {
    dispatch(setSearchQuery(value || null));
  };

  const handleDebouncedEditFormChange = (field: string) => (value: string) => {
    dispatch(updateEditForm({ [field]: value }));
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    dispatch(setCurrentPage(page));
  };

  const handleUpdateMovie = async (movieData: any) => {
    if (editingMovieId) {
      try {
        // Check if this is a temporary ID (new movie)
        if (editingMovieId.startsWith("temp_")) {
          // Create new movie
          await dispatch(
            createMovieRecord({
              filename: movieData.filename || "unknown.mp4",
              ...movieData,
            })
          ).unwrap();
        } else {
          // Update existing movie - preserve the original filename
          const movie = movies.find((m) => m.id === editingMovieId);
          await dispatch(
            updateMovieRecord({
              id: editingMovieId,
              movieData: {
                ...movieData,
                filename: movie?.filename || movieData.filename || "unknown.mp4",
              },
            })
          ).unwrap();
        }
        dispatch(setEditingMovieId(null));
        dispatch(clearEditForm());
      } catch (error) {
        console.error("Failed to update movie:", error);
      }
    }
  };

  const handleDeleteMovie = async (movieId: string) => {
    if (window.confirm("Are you sure you want to delete this movie?")) {
      try {
        await dispatch(deleteMovieRecord(movieId)).unwrap();
      } catch (error) {
        console.error("Failed to delete movie:", error);
      }
    }
  };

  const handleEditMovie = (movie: any) => {
    dispatch(setEditingMovieId(movie.id));
    dispatch(
      updateEditForm({
        title: movie.title || movie.filename || "",
        description: movie.description || "",
        score: movie.score || 0,
        release_date: movie.release_date || "",
      })
    );
  };

  const handleCancelEdit = () => {
    dispatch(setEditingMovieId(null));
    dispatch(clearEditForm());
  };

  const handleCardClick = (movie: any) => {
    if (movie.title && movie.description && movie.score !== undefined && movie.release_date) {
      router.push(`/videos/${movie.id}`);
    }
  };

  const toggleCardExpansion = (movieId: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(movieId)) {
        newSet.delete(movieId);
      } else {
        newSet.add(movieId);
      }
      return newSet;
    });
  };

  const handleFilterChange = (filterType: string, value: any) => {
    // Individual filter changes - not used by VideoFilters component
    console.log("Filter change:", filterType, value);
  };

  const handleBatchFilterUpdate = (newFilters: any) => {
    // Update all filters at once via Redux actions
    if (newFilters.year !== undefined) {
      dispatch(setYearFilter(newFilters.year));
    }
    if (newFilters.actor !== undefined) {
      dispatch(setActorFilter(newFilters.actor));
    }
    if (newFilters.genre !== undefined) {
      dispatch(setGenreFilter(newFilters.genre));
    }
    if (newFilters.runtimeMin !== undefined || newFilters.runtimeMax !== undefined) {
      dispatch(setRuntimeFilter({ min: newFilters.runtimeMin, max: newFilters.runtimeMax }));
    }
    if (newFilters.ratingMin !== undefined || newFilters.ratingMax !== undefined) {
      dispatch(setRatingFilter({ min: newFilters.ratingMin, max: newFilters.ratingMax }));
    }
    if (newFilters.showUnrecorded !== undefined) {
      dispatch(setShowUnrecordedFilter(newFilters.showUnrecorded));
    }
  };

  const handleClearFilters = () => {
    // Clear all filters via Redux actions
    dispatch(setYearFilter(null));
    dispatch(setActorFilter(null));
    dispatch(setGenreFilter(null));
    dispatch(setRuntimeFilter({ min: null, max: null }));
    dispatch(setRatingFilter({ min: null, max: null }));
    dispatch(setShowUnrecordedFilter(null));
  };

  const hasCompleteData = (movie: any) => {
    return movie.title && movie.description && movie.score !== undefined && movie.release_date;
  };

  // Filter movies based on showUnrecorded state
  const filteredMovies = movies.filter((movie) => {
    const isUnrecorded = movie.id.startsWith("temp_");
    if (showUnrecordedFilter === true) {
      // Show only unrecorded movies
      return isUnrecorded;
    } else {
      // Default: hide unrecorded movies (show only recorded movies)
      return !isUnrecorded;
    }
  });

  // Debug logging to understand what's happening
  React.useEffect(() => {
    console.log("Movies Debug:", {
      totalMovies: movies.length,
      showUnrecordedFilter,
      filteredMovies: filteredMovies.length,
      recordedMovies: movies.filter((m) => !m.id.startsWith("temp_")).length,
      unrecordedMovies: movies.filter((m) => m.id.startsWith("temp_")).length,
      urlSyncInitialized,
    });
  }, [movies, showUnrecordedFilter, filteredMovies.length, urlSyncInitialized]);

  // Calculate pagination based on filtered results
  const totalFilteredMovies = filteredMovies.length;
  const totalPages = Math.ceil(totalFilteredMovies / moviesPerPage);
  const startIndex = (currentPage - 1) * moviesPerPage;
  const endIndex = startIndex + moviesPerPage;
  const paginatedMovies = filteredMovies.slice(startIndex, endIndex);

  // Reset to page 1 if current page exceeds total pages
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      dispatch(setCurrentPage(1));
    }
  }, [currentPage, totalPages, dispatch]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" component="h1">
          Movies ({totalFilteredMovies})
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => dispatch(setShowCreateForm(true))}>
          Add Movie
        </Button>
      </Box>

      {/* Filters */}
      <VideoFilters filters={filters} filterOptions={filterOptions} onFilterChange={handleFilterChange} onBatchFilterUpdate={handleBatchFilterUpdate} onClearFilters={handleClearFilters} />

      {/* Search and Sort */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <Box sx={{ flex: "1 1 300px" }}>
            <IsolatedTextField
              fullWidth
              label="Search movies..."
              value={searchQuery || ""}
              onDebouncedChange={handleDebouncedSearchChange}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
              }}
            />
          </Box>

          <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select value={sortBy} label="Sort By" onChange={(e) => dispatch(setSortBy(e.target.value as any))}>
                <MenuItem value="release_date">Release Date</MenuItem>
                <MenuItem value="rank">Rating</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
              <InputLabel>Order</InputLabel>
              <Select value={sortOrder} label="Order" onChange={(e) => dispatch(setSortOrder(e.target.value as any))}>
                <MenuItem value="desc">Descending</MenuItem>
                <MenuItem value="asc">Ascending</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Movies Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
          gap: 3,
          mb: 4,
        }}
      >
        {paginatedMovies.map((movie) => (
          <Card
            key={movie.id}
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              cursor: hasCompleteData(movie) ? "pointer" : "default",
              "&:hover": hasCompleteData(movie)
                ? {
                    boxShadow: 4,
                    transform: "translateY(-2px)",
                    transition: "all 0.2s ease-in-out",
                  }
                : {},
            }}
            onClick={() => handleCardClick(movie)}
          >
            <CardMedia component="img" height="300" image={movie.poster_path || "/images/posters/default-movie.svg"} alt={movie.title || movie.filename} sx={{ objectFit: "cover" }} />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="h2" gutterBottom noWrap>
                {movie.title || movie.filename}
              </Typography>

              {movie.release_date && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {new Date(movie.release_date).getFullYear()}
                </Typography>
              )}

              {movie.score !== undefined && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Rating value={movie.score} max={10} readOnly size="small" />
                  <Typography variant="body2" color="text.secondary">
                    {movie.score}/10
                  </Typography>
                </Box>
              )}

              {movie.tmdb_id && (
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  TMDb ID: {movie.tmdb_id}
                </Typography>
              )}

              {movie.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    mt: 1,
                  }}
                >
                  {movie.description}
                </Typography>
              )}

              {movie.genres && movie.genres.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  {movie.genres.slice(0, 2).map((genre, index) => (
                    <Chip key={index} label={genre} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                  ))}
                </Box>
              )}

              {/* Advanced Information Dropdown */}
              {(movie.runtime || movie.vote_average || movie.production_companies || movie.cast) && (
                <Box sx={{ mt: 1 }}>
                  <Button
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCardExpansion(movie.id);
                    }}
                    endIcon={expandedCards.has(movie.id) ? <ExpandLess /> : <ExpandMore />}
                  >
                    Advanced Info
                  </Button>
                  <Collapse in={expandedCards.has(movie.id)}>
                    <Box sx={{ mt: 1, p: 1, bgcolor: "grey.50", borderRadius: 1 }}>
                      {movie.runtime && (
                        <Typography variant="caption" display="block">
                          Runtime: {movie.runtime} min
                        </Typography>
                      )}
                      {movie.vote_average && (
                        <Typography variant="caption" display="block">
                          TMDb Rating: {movie.vote_average}/10
                        </Typography>
                      )}
                      {movie.production_companies && movie.production_companies.length > 0 && (
                        <Typography variant="caption" display="block">
                          Studio: {movie.production_companies.slice(0, 2).join(", ")}
                        </Typography>
                      )}
                      {movie.cast && movie.cast.length > 0 && (
                        <Typography variant="caption" display="block">
                          Cast:{" "}
                          {movie.cast
                            .slice(0, 3)
                            .map((actor: any) => actor.name)
                            .join(", ")}
                        </Typography>
                      )}
                    </Box>
                  </Collapse>
                </Box>
              )}
            </CardContent>

            <Box sx={{ p: 1, display: "flex", justifyContent: "space-between" }}>
              <Button
                size="small"
                startIcon={<Edit />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditMovie(movie);
                }}
              >
                {hasCompleteData(movie) ? "Edit" : "Add"}
              </Button>
              <Button
                size="small"
                color="error"
                startIcon={<Delete />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteMovie(movie.id);
                }}
                disabled={movie.id.startsWith("temp_")}
              >
                Delete
              </Button>
            </Box>
          </Card>
        ))}
      </Box>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} color="primary" size="large" />
        </Box>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingMovieId} onClose={handleCancelEdit} maxWidth="lg" fullWidth scroll="paper">
        <DialogContent sx={{ p: 0, maxHeight: "80vh", overflow: "auto" }}>
          {editingMovieId &&
            (() => {
              const movie = movies.find((m) => m.id === editingMovieId);
              if (!movie) return null;

              // Convert MovieRecord to VideoRecord format
              const videoRecord = {
                ...movie,
                cast: movie.cast?.map((actor) => ({ name: actor, character: "", profile_path: "" })) || [],
              };

              return <VideoForm video={videoRecord} onSubmit={handleUpdateMovie} onCancel={handleCancelEdit} mode="edit" type="movie" />;
            })()}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
