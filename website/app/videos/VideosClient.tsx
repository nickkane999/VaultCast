"use client";

import React, { useEffect, useTransition, useState } from "react";
import { Container, Typography, Button, Box, Pagination, FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress } from "@mui/material";
import { Provider, useDispatch } from "react-redux";
import { store } from "@/store/store";
import { setVideos } from "@/store/videosSlice";
import { useVideos } from "@/lib/features/videos/useVideos";
import VideoCard from "@/lib/features/videos/VideoCard";
import VideoForm from "@/lib/features/videos/VideoForm";
import { VideoRecord } from "@/lib/features/videos/types";

interface VideosData {
  videos: VideoRecord[];
  totalVideos: number;
  currentPage: number;
  totalPages: number;
}

interface VideosClientProps {
  initialData: VideosData;
  refreshAction: () => Promise<void>;
}

function VideosContent({ initialData, refreshAction }: VideosClientProps) {
  const dispatch = useDispatch();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const {
    videos,
    currentPage,
    totalPages,
    totalVideos,
    yearFilter,
    sortBy,
    sortOrder,
    loading,
    error: videosError,
    showCreateForm,
    editingVideoId,
    editForm,
    availableYears,
    handleFetchVideos,
    handlePageChange,
    handleYearFilterChange,
    handleSortChange,
    handleShowCreateForm,
    handleEditVideo,
    handleCancelForm,
    handleCreateVideo,
    handleUpdateVideo,
    handleVideoCardClick,
    handleClearError,
  } = useVideos();

  useEffect(() => {
    console.log("Initializing Videos with data:", initialData);
    dispatch(setVideos(initialData.videos));
  }, [dispatch, initialData]);

  const handleRefresh = () => {
    startTransition(async () => {
      try {
        await refreshAction();
        setError(null);
      } catch (err) {
        setError("Failed to refresh data");
      }
    });
  };

  const handleFormSubmit = (formData: any) => {
    if (editingVideoId) {
      handleUpdateVideo(formData);
    } else {
      const videoFilename = videos.find((v) => v.id.startsWith("temp_"))?.filename;
      if (videoFilename) {
        handleCreateVideo({ ...formData, filename: videoFilename });
      }
    }
  };

  const editingVideo = editingVideoId ? videos.find((v) => v.id === editingVideoId) || undefined : undefined;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Video Library
      </Typography>

      {(error || videosError) && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => {
            setError(null);
            handleClearError();
          }}
        >
          {error || videosError}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
        <Button variant="outlined" onClick={handleRefresh} disabled={isPending || loading}>
          {isPending || loading ? "Loading..." : "Refresh"}
        </Button>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Year</InputLabel>
          <Select value={yearFilter || ""} label="Year" onChange={(e) => handleYearFilterChange(e.target.value || null)}>
            <MenuItem value="">All Years</MenuItem>
            {availableYears.map((year) => (
              <MenuItem key={year} value={year.toString()}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={`${sortBy}-${sortOrder}`}
            label="Sort By"
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split("-") as ["rank" | "release_date", "asc" | "desc"];
              handleSortChange(newSortBy, newSortOrder);
            }}
          >
            <MenuItem value="release_date-desc">Newest First</MenuItem>
            <MenuItem value="release_date-asc">Oldest First</MenuItem>
            <MenuItem value="rank-desc">Highest Rated</MenuItem>
            <MenuItem value="rank-asc">Lowest Rated</MenuItem>
          </Select>
        </FormControl>

        <Typography variant="body2" color="text.secondary" sx={{ ml: "auto" }}>
          {totalVideos} videos total
        </Typography>
      </Box>

      {showCreateForm && <VideoForm video={editingVideo} onSubmit={handleFormSubmit} onCancel={handleCancelForm} mode={editingVideoId ? "edit" : "create"} />}

      {loading && !showCreateForm && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && !showCreateForm && (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 3,
              mb: 4,
            }}
          >
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onEditClick={() => {
                  if (video.id.startsWith("temp_")) {
                    handleShowCreateForm(video.filename);
                  } else {
                    handleEditVideo(video.id);
                  }
                }}
                onCardClick={() => handleVideoCardClick(video)}
              />
            ))}
          </Box>

          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination count={totalPages} page={currentPage} onChange={(event, page) => handlePageChange(page)} color="primary" size="large" />
            </Box>
          )}

          {videos.length === 0 && (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No videos found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Check that your content server is running and has video files
              </Typography>
            </Box>
          )}
        </>
      )}
    </Container>
  );
}

export default function VideosClient(props: VideosClientProps) {
  return (
    <Provider store={store}>
      <VideosContent {...props} />
    </Provider>
  );
}
