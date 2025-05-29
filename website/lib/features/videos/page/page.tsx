"use client";

import React, { useEffect, useState } from "react";
import { Container, Typography, Paper, Box, Grid, Tabs, Tab, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import VideoCard from "../VideoCard";
import VideoForm from "../VideoForm";
import VideoFilters from "../VideoFilters";
import TMDbSearchDialog from "../TMDbSearchDialog";
import { fetchVideos, addVideo, updateVideo, deleteVideo, clearFilters } from "../store/videosSlice";
import { VideoRecord, VideoFormData } from "../types";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`videos-tabpanel-${index}`} aria-labelledby={`videos-tab-${index}`} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function VideosPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [tabValue, setTabValue] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoRecord | null>(null);
  const [isTMDbOpen, setIsTMDbOpen] = useState(false);
  const [currentType, setCurrentType] = useState<"movie" | "tv">("movie");

  const { videos, loading, error, currentPage, totalVideos, videosPerPage } = useSelector((state: RootState) => state.videos);

  useEffect(() => {
    dispatch(fetchVideos({ type: currentType }));
  }, [dispatch, currentType]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setCurrentType(newValue === 0 ? "movie" : "tv");
    dispatch(clearFilters());
  };

  const handleAddVideo = () => {
    setEditingVideo(null);
    setIsFormOpen(true);
  };

  const handleEditVideo = (video: VideoRecord) => {
    setEditingVideo(video);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: VideoFormData) => {
    if (editingVideo) {
      dispatch(updateVideo({ id: editingVideo.id, data }));
    } else {
      dispatch(addVideo(data));
    }
    setIsFormOpen(false);
    setEditingVideo(null);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingVideo(null);
  };

  const handleDeleteVideo = (videoId: string) => {
    if (confirm("Are you sure you want to delete this video?")) {
      dispatch(deleteVideo(videoId));
    }
  };

  const handleCardClick = (video: VideoRecord) => {
    // Handle video card click - could navigate to detail view
    console.log("Video clicked:", video.title);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Video Library
      </Typography>
      <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Manage your movie and TV show collection with advanced filtering and TMDb integration
      </Typography>

      <Paper elevation={3}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3, pt: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="video type tabs">
              <Tab label="Movies" />
              <Tab label="TV Shows" />
            </Tabs>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button variant="outlined" onClick={() => setIsTMDbOpen(true)}>
                Search TMDb
              </Button>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddVideo}>
                Add {currentType === "movie" ? "Movie" : "TV Show"}
              </Button>
            </Box>
          </Box>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ px: 3 }}>
            {/* Filters */}
            <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
              <VideoFilters type="movie" />
            </Paper>

            {/* Movie Grid */}
            <Grid container spacing={3}>
              {videos.map((video) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={video.id}>
                  <VideoCard video={video} onEditClick={() => handleEditVideo(video)} onCardClick={() => handleCardClick(video)} />
                </Grid>
              ))}
            </Grid>

            {videos.length === 0 && !loading && (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  No movies found. Add your first movie to get started!
                </Typography>
              </Box>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ px: 3 }}>
            {/* Filters */}
            <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
              <VideoFilters type="tv" />
            </Paper>

            {/* TV Shows Grid */}
            <Grid container spacing={3}>
              {videos.map((video) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={video.id}>
                  <VideoCard video={video} onEditClick={() => handleEditVideo(video)} onCardClick={() => handleCardClick(video)} />
                </Grid>
              ))}
            </Grid>

            {videos.length === 0 && !loading && (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  No TV shows found. Add your first show to get started!
                </Typography>
              </Box>
            )}
          </Box>
        </TabPanel>
      </Paper>

      {/* Video Form Dialog */}
      <Dialog open={isFormOpen} onClose={handleFormCancel} maxWidth="md" fullWidth>
        <DialogTitle>{editingVideo ? `Edit ${currentType === "movie" ? "Movie" : "TV Show"}` : `Add ${currentType === "movie" ? "Movie" : "TV Show"}`}</DialogTitle>
        <DialogContent>
          <VideoForm video={editingVideo || undefined} onSubmit={handleFormSubmit} onCancel={handleFormCancel} mode={editingVideo ? "edit" : "create"} type={currentType} />
        </DialogContent>
      </Dialog>

      {/* TMDb Search Dialog */}
      <TMDbSearchDialog
        open={isTMDbOpen}
        onClose={() => setIsTMDbOpen(false)}
        type={currentType}
        onSelectResult={(result) => {
          // Handle TMDb result selection
          setIsTMDbOpen(false);
          // Could auto-fill form with TMDb data
        }}
      />
    </Container>
  );
}
