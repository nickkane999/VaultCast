"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchTVShows,
  createTVEpisodeRecord,
  updateTVEpisodeRecord,
  deleteTVEpisodeRecord,
  setCurrentPage,
  setShowFilter,
  setSeasonFilter,
  setYearFilter,
  setActorFilter,
  setGenreFilter,
  setRuntimeFilter,
  setRatingFilter,
  setSearchQuery,
  setSortBy,
  setSortOrder,
  setShowCreateForm,
  setEditingEpisodeId,
  updateEditForm,
  clearEditForm,
} from "@/store/tvShowsSlice";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
  Collapse,
  IconButton,
} from "@mui/material";
import { Add, Edit, Delete, Search, ExpandMore, ExpandLess, Tv } from "@mui/icons-material";
import IsolatedTextField from "@/lib/components/IsolatedTextField";
import VideoForm from "@/lib/features/videos/VideoForm";
import VideoFilters from "@/lib/features/videos/VideoFilters";
import { useRouter, useSearchParams } from "next/navigation";

export default function TVShowsClient() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state for advanced info
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [urlSyncInitialized, setUrlSyncInitialized] = useState(false);

  // Memoized selectors for specific state pieces
  const episodes = useSelector((state: RootState) => state.tvShows.episodes);
  const shows = useSelector((state: RootState) => state.tvShows.shows);
  const currentPage = useSelector((state: RootState) => state.tvShows.currentPage);
  const totalEpisodes = useSelector((state: RootState) => state.tvShows.totalEpisodes);
  const episodesPerPage = useSelector((state: RootState) => state.tvShows.episodesPerPage);
  const loading = useSelector((state: RootState) => state.tvShows.loading);
  const error = useSelector((state: RootState) => state.tvShows.error);
  const editingEpisodeId = useSelector((state: RootState) => state.tvShows.editingEpisodeId);
  const editForm = useSelector((state: RootState) => state.tvShows.editForm);
  const showFilter = useSelector((state: RootState) => state.tvShows.showFilter);
  const seasonFilter = useSelector((state: RootState) => state.tvShows.seasonFilter);
  const yearFilter = useSelector((state: RootState) => state.tvShows.yearFilter);
  const actorFilter = useSelector((state: RootState) => state.tvShows.actorFilter);
  const genreFilter = useSelector((state: RootState) => state.tvShows.genreFilter);
  const runtimeFilter = useSelector((state: RootState) => state.tvShows.runtimeFilter);
  const ratingFilter = useSelector((state: RootState) => state.tvShows.ratingFilter);
  const searchQuery = useSelector((state: RootState) => state.tvShows.searchQuery);
  const sortBy = useSelector((state: RootState) => state.tvShows.sortBy);
  const sortOrder = useSelector((state: RootState) => state.tvShows.sortOrder);
  const filterOptions = useSelector((state: RootState) => state.tvShows.filterOptions);

  // Create filters object from Redux state
  const filters = {
    year: yearFilter,
    actor: actorFilter,
    genre: genreFilter,
    runtimeMin: runtimeFilter.min,
    runtimeMax: runtimeFilter.max,
    ratingMin: ratingFilter.min,
    ratingMax: ratingFilter.max,
  };

  // Initialize filters from URL on component mount
  useEffect(() => {
    if (!urlSyncInitialized) {
      const urlPage = searchParams.get("page");
      const urlShow = searchParams.get("show");
      const urlSeason = searchParams.get("season");
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

      if (urlPage && parseInt(urlPage) !== currentPage) {
        dispatch(setCurrentPage(parseInt(urlPage)));
      }
      if (urlShow && urlShow !== showFilter) {
        dispatch(setShowFilter(urlShow));
      }
      if (urlSeason && parseInt(urlSeason) !== seasonFilter) {
        dispatch(setSeasonFilter(parseInt(urlSeason)));
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
      if (urlSortBy && (urlSortBy === "air_date" || urlSortBy === "episode_number" || urlSortBy === "rating") && urlSortBy !== sortBy) {
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

      setUrlSyncInitialized(true);
    }
  }, [searchParams, dispatch, urlSyncInitialized, currentPage, showFilter, seasonFilter, yearFilter, actorFilter, genreFilter, searchQuery, sortBy, sortOrder, ratingFilter, runtimeFilter]);

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

      if (showFilter) {
        params.set("show", showFilter);
      } else {
        params.delete("show");
      }

      if (seasonFilter !== null) {
        params.set("season", seasonFilter.toString());
      } else {
        params.delete("season");
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

      if (sortBy !== "air_date") {
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

      const newUrl = `/videos?${params.toString()}`;
      if (newUrl !== `/videos?${searchParams.toString()}`) {
        router.replace(newUrl);
      }
    }
  }, [urlSyncInitialized, currentPage, showFilter, seasonFilter, yearFilter, actorFilter, genreFilter, searchQuery, sortBy, sortOrder, ratingFilter, runtimeFilter, router, searchParams]);

  // Fetch TV shows on component mount and when filters change
  useEffect(() => {
    if (urlSyncInitialized) {
      dispatch(
        fetchTVShows({
          page: currentPage,
          limit: episodesPerPage,
          showFilter: showFilter || undefined,
          seasonFilter: seasonFilter || undefined,
          yearFilter: yearFilter || undefined,
          actorFilter: actorFilter || undefined,
          genreFilter: genreFilter || undefined,
          runtimeMin: runtimeFilter.min || undefined,
          runtimeMax: runtimeFilter.max || undefined,
          ratingMin: ratingFilter.min || undefined,
          ratingMax: ratingFilter.max || undefined,
          searchQuery: searchQuery || undefined,
          sortBy,
          sortOrder,
        })
      );
    }
  }, [dispatch, urlSyncInitialized, currentPage, episodesPerPage, showFilter, seasonFilter, yearFilter, actorFilter, genreFilter, runtimeFilter, ratingFilter, searchQuery, sortBy, sortOrder]);

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

  const handleUpdateEpisode = async (episodeData: any) => {
    if (editingEpisodeId) {
      try {
        // Check if this is a temporary ID (new episode)
        if (editingEpisodeId.startsWith("temp_")) {
          // Create new episode
          await dispatch(
            createTVEpisodeRecord({
              filename: episodeData.filename || "unknown.mp4",
              ...episodeData,
            })
          ).unwrap();
        } else {
          // Update existing episode - preserve the original filename
          const episode = episodes.find((e) => e.id === editingEpisodeId);
          await dispatch(
            updateTVEpisodeRecord({
              id: editingEpisodeId,
              episodeData: {
                ...episodeData,
                filename: episode?.filename || episodeData.filename || "unknown.mp4",
              },
            })
          ).unwrap();
        }
        dispatch(setEditingEpisodeId(null));
        dispatch(clearEditForm());
      } catch (error) {
        console.error("Failed to update episode:", error);
      }
    }
  };

  const handleCancelEdit = () => {
    dispatch(setEditingEpisodeId(null));
    dispatch(clearEditForm());
  };

  const handleDeleteEpisode = async (episodeId: string) => {
    if (window.confirm("Are you sure you want to delete this episode?")) {
      try {
        await dispatch(deleteTVEpisodeRecord(episodeId)).unwrap();
      } catch (error) {
        console.error("Failed to delete episode:", error);
      }
    }
  };

  const handleEditEpisode = (episode: any) => {
    dispatch(setEditingEpisodeId(episode.id));
    dispatch(
      updateEditForm({
        title: episode.title || episode.filename || "",
        description: episode.description || "",
        score: episode.score || 0,
        air_date: episode.air_date || "",
        season_number: episode.season_number || 1,
        episode_number: episode.episode_number || 1,
        show_name: episode.show_name || "",
      })
    );
  };

  const handleCardClick = (episode: any) => {
    if (episode.title && episode.description && episode.score !== undefined && episode.air_date) {
      router.push(`/videos/${episode.id}`);
    }
  };

  const toggleCardExpansion = (episodeId: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(episodeId)) {
        newSet.delete(episodeId);
      } else {
        newSet.add(episodeId);
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
  };

  const handleClearFilters = () => {
    // Clear all filters via Redux actions
    dispatch(setYearFilter(null));
    dispatch(setActorFilter(null));
    dispatch(setGenreFilter(null));
    dispatch(setRuntimeFilter({ min: null, max: null }));
    dispatch(setRatingFilter({ min: null, max: null }));
  };

  const hasCompleteData = (episode: any) => {
    return episode.title && episode.description && episode.score !== undefined && episode.air_date;
  };

  const totalPages = Math.ceil(totalEpisodes / episodesPerPage);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" component="h1">
          TV Shows ({totalEpisodes} episodes)
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => dispatch(setShowCreateForm(true))}>
          Add Episode
        </Button>
      </Box>

      {/* Filters */}
      <VideoFilters filters={filters} filterOptions={filterOptions} onFilterChange={handleFilterChange} onBatchFilterUpdate={handleBatchFilterUpdate} onClearFilters={handleClearFilters} />

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <Box sx={{ flex: "1 1 300px" }}>
            <IsolatedTextField
              fullWidth
              label="Search episodes..."
              value={searchQuery || ""}
              onDebouncedChange={handleDebouncedSearchChange}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
              }}
            />
          </Box>

          <Box sx={{ minWidth: 150 }}>
            <FormControl fullWidth>
              <InputLabel>Show</InputLabel>
              <Select value={showFilter || ""} label="Show" onChange={(e) => dispatch(setShowFilter(e.target.value || null))}>
                <MenuItem value="">All Shows</MenuItem>
                {filterOptions.shows.map((show) => (
                  <MenuItem key={show} value={show}>
                    {show}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
              <InputLabel>Season</InputLabel>
              <Select value={seasonFilter || ""} label="Season" onChange={(e) => dispatch(setSeasonFilter(e.target.value ? Number(e.target.value) : null))}>
                <MenuItem value="">All Seasons</MenuItem>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((season) => (
                  <MenuItem key={season} value={season}>
                    Season {season}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select value={sortBy} label="Sort By" onChange={(e) => dispatch(setSortBy(e.target.value as any))}>
                <MenuItem value="air_date">Air Date</MenuItem>
                <MenuItem value="episode_number">Episode Number</MenuItem>
                <MenuItem value="rating">Rating</MenuItem>
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

      {/* Shows Hierarchy View */}
      {shows.length > 0 && !showFilter && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Shows Overview
          </Typography>
          {shows.map((show) => (
            <Accordion key={show.name} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">
                  {show.name} ({show.totalEpisodes} episodes)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {show.seasons.map((season) => (
                    <Chip
                      key={season.seasonNumber}
                      label={`Season ${season.seasonNumber} (${season.episodeCount})`}
                      onClick={() => {
                        dispatch(setShowFilter(show.name));
                        dispatch(setSeasonFilter(season.seasonNumber));
                      }}
                      clickable
                      variant="outlined"
                    />
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Episodes Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
          gap: 3,
          mb: 4,
        }}
      >
        {episodes.map((episode) => (
          <Card
            key={episode.id}
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              cursor: hasCompleteData(episode) ? "pointer" : "default",
              "&:hover": hasCompleteData(episode)
                ? {
                    boxShadow: 4,
                    transform: "translateY(-2px)",
                    transition: "all 0.2s ease-in-out",
                  }
                : {},
            }}
            onClick={() => handleCardClick(episode)}
          >
            <CardMedia component="img" height="200" image={episode.poster_path || "/images/posters/default-tv.svg"} alt={episode.title || episode.filename} sx={{ objectFit: "cover" }} />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="h2" gutterBottom noWrap>
                {episode.title || episode.filename}
              </Typography>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                {episode.show_name} - S{episode.season_number}E{episode.episode_number}
              </Typography>

              {episode.air_date && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {new Date(episode.air_date).toLocaleDateString()}
                </Typography>
              )}

              {episode.score !== undefined && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Rating value={episode.score} max={10} readOnly size="small" />
                  <Typography variant="body2" color="text.secondary">
                    {episode.score}/10
                  </Typography>
                </Box>
              )}

              {episode.tmdb_id && (
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  TMDb ID: {episode.tmdb_id}
                </Typography>
              )}

              {episode.description && (
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
                  {episode.description}
                </Typography>
              )}

              {episode.genres && episode.genres.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  {episode.genres.slice(0, 2).map((genre, index) => (
                    <Chip key={index} label={genre} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                  ))}
                </Box>
              )}

              {/* Advanced Information Dropdown */}
              {(episode.runtime || episode.vote_average || episode.cast) && (
                <Box sx={{ mt: 1 }}>
                  <Button
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCardExpansion(episode.id);
                    }}
                    endIcon={expandedCards.has(episode.id) ? <ExpandLess /> : <ExpandMore />}
                  >
                    Advanced Info
                  </Button>
                  <Collapse in={expandedCards.has(episode.id)}>
                    <Box sx={{ mt: 1, p: 1, bgcolor: "grey.50", borderRadius: 1 }}>
                      {episode.runtime && (
                        <Typography variant="caption" display="block">
                          Runtime: {episode.runtime} min
                        </Typography>
                      )}
                      {episode.vote_average && (
                        <Typography variant="caption" display="block">
                          TMDb Rating: {episode.vote_average}/10
                        </Typography>
                      )}

                      {episode.cast && episode.cast.length > 0 && (
                        <Typography variant="caption" display="block">
                          Cast:{" "}
                          {episode.cast
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
                  handleEditEpisode(episode);
                }}
              >
                {hasCompleteData(episode) ? "Edit" : "Add"}
              </Button>
              <Button
                size="small"
                color="error"
                startIcon={<Delete />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteEpisode(episode.id);
                }}
                disabled={episode.id.startsWith("temp_")}
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
      <Dialog open={!!editingEpisodeId} onClose={handleCancelEdit} maxWidth="lg" fullWidth scroll="paper">
        <DialogContent sx={{ p: 0, maxHeight: "80vh", overflow: "auto" }}>
          {editingEpisodeId &&
            (() => {
              const episode = episodes.find((e) => e.id === editingEpisodeId);
              if (!episode) return null;

              // Convert TVEpisodeRecord to VideoRecord format
              const videoRecord = {
                ...episode,
                cast: episode.cast?.map((actor) => ({ name: actor, character: "", profile_path: "" })) || [],
              };

              return <VideoForm video={videoRecord} onSubmit={handleUpdateEpisode} onCancel={handleCancelEdit} mode="edit" type="tv" />;
            })()}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
