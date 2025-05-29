import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { VideoRecord, VideoFormData, VideoListState, TMDbMovieData } from "../types";

const initialState: VideoListState = {
  videos: [],
  currentPage: 1,
  videosPerPage: 20,
  totalVideos: 0,
  yearFilter: null,
  actorFilter: null,
  genreFilter: null,
  runtimeFilter: { min: null, max: null },
  ratingFilter: { min: null, max: null },
  searchQuery: null,
  sortBy: "release_date",
  sortOrder: "desc",
  loading: false,
  error: null,
};

// Async thunks
export const fetchVideos = createAsyncThunk(
  "videos/fetchVideos",
  async (params: { page?: number; limit?: number; year?: string; actors?: string[]; genres?: string[]; runtime?: { min: number | null; max: number | null }; rating?: { min: number | null; max: number | null }; search?: string; sortBy?: string; sortOrder?: string; type?: "movie" | "tv" }) => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.set("page", params.page.toString());
    if (params.limit) queryParams.set("limit", params.limit.toString());
    if (params.year) queryParams.set("year", params.year);
    if (params.actors) queryParams.set("actors", params.actors.join(","));
    if (params.genres) queryParams.set("genres", params.genres.join(","));
    if (params.runtime?.min !== null && params.runtime?.min !== undefined) queryParams.set("runtimeMin", params.runtime.min.toString());
    if (params.runtime?.max !== null && params.runtime?.max !== undefined) queryParams.set("runtimeMax", params.runtime.max.toString());
    if (params.rating?.min !== null && params.rating?.min !== undefined) queryParams.set("ratingMin", params.rating.min.toString());
    if (params.rating?.max !== null && params.rating?.max !== undefined) queryParams.set("ratingMax", params.rating.max.toString());
    if (params.search) queryParams.set("search", params.search);
    if (params.sortBy) queryParams.set("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.set("sortOrder", params.sortOrder);
    if (params.type) queryParams.set("type", params.type);

    const response = await fetch(`/api/videos?${queryParams}`);
    if (!response.ok) {
      throw new Error("Failed to fetch videos");
    }
    return response.json();
  }
);

export const addVideo = createAsyncThunk("videos/addVideo", async (videoData: VideoFormData) => {
  const response = await fetch("/api/videos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(videoData),
  });

  if (!response.ok) {
    throw new Error("Failed to add video");
  }
  return response.json();
});

export const updateVideo = createAsyncThunk("videos/updateVideo", async ({ id, data }: { id: string; data: VideoFormData }) => {
  const response = await fetch(`/api/videos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update video");
  }
  return response.json();
});

export const deleteVideo = createAsyncThunk("videos/deleteVideo", async (id: string) => {
  const response = await fetch(`/api/videos/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete video");
  }
  return id;
});

export const searchTMDb = createAsyncThunk("videos/searchTMDb", async ({ query, type }: { query: string; type: "movie" | "tv" }) => {
  const response = await fetch(`/api/videos/tmdb/search?query=${encodeURIComponent(query)}&type=${type}`);
  if (!response.ok) {
    throw new Error("Failed to search TMDb");
  }
  return response.json();
});

export const fetchTMDbDetails = createAsyncThunk("videos/fetchTMDbDetails", async ({ id, type }: { id: number; type: "movie" | "tv" }) => {
  const response = await fetch(`/api/videos/tmdb/${type}/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch TMDb details");
  }
  return response.json();
});

export const bulkUpdateVideos = createAsyncThunk("videos/bulkUpdateVideos", async (options: { updateTrailers: boolean; updateMissingInfo: boolean; overwriteExisting: boolean; batchSize: number; type: "movie" | "tv" }) => {
  const response = await fetch("/api/videos/bulk-update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    throw new Error("Failed to start bulk update");
  }
  return response.json();
});

const videosSlice = createSlice({
  name: "videos",
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setVideosPerPage: (state, action: PayloadAction<number>) => {
      state.videosPerPage = action.payload;
      state.currentPage = 1; // Reset to first page when changing page size
    },
    setYearFilter: (state, action: PayloadAction<string | null>) => {
      state.yearFilter = action.payload;
      state.currentPage = 1;
    },
    setActorFilter: (state, action: PayloadAction<string[] | null>) => {
      state.actorFilter = action.payload;
      state.currentPage = 1;
    },
    setGenreFilter: (state, action: PayloadAction<string[] | null>) => {
      state.genreFilter = action.payload;
      state.currentPage = 1;
    },
    setRuntimeFilter: (state, action: PayloadAction<{ min: number | null; max: number | null }>) => {
      state.runtimeFilter = action.payload;
      state.currentPage = 1;
    },
    setRatingFilter: (state, action: PayloadAction<{ min: number | null; max: number | null }>) => {
      state.ratingFilter = action.payload;
      state.currentPage = 1;
    },
    setSearchQuery: (state, action: PayloadAction<string | null>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1;
    },
    setSortBy: (state, action: PayloadAction<"rank" | "release_date">) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<"asc" | "desc">) => {
      state.sortOrder = action.payload;
    },
    clearFilters: (state) => {
      state.yearFilter = null;
      state.actorFilter = null;
      state.genreFilter = null;
      state.runtimeFilter = { min: null, max: null };
      state.ratingFilter = { min: null, max: null };
      state.searchQuery = null;
      state.currentPage = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
    addVideoToList: (state, action: PayloadAction<VideoRecord>) => {
      state.videos.unshift(action.payload);
      state.totalVideos += 1;
    },
    updateVideoInList: (state, action: PayloadAction<VideoRecord>) => {
      const index = state.videos.findIndex((video) => video.id === action.payload.id);
      if (index !== -1) {
        state.videos[index] = action.payload;
      }
    },
    removeVideoFromList: (state, action: PayloadAction<string>) => {
      state.videos = state.videos.filter((video) => video.id !== action.payload);
      state.totalVideos = Math.max(0, state.totalVideos - 1);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVideos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVideos.fulfilled, (state, action) => {
        state.loading = false;
        state.videos = action.payload.videos || [];
        state.totalVideos = action.payload.total || 0;
        state.currentPage = action.payload.page || 1;
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch videos";
      })
      .addCase(addVideo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addVideo.fulfilled, (state, action) => {
        state.loading = false;
        state.videos.unshift(action.payload);
        state.totalVideos += 1;
      })
      .addCase(addVideo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to add video";
      })
      .addCase(updateVideo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVideo.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.videos.findIndex((video) => video.id === action.payload.id);
        if (index !== -1) {
          state.videos[index] = action.payload;
        }
      })
      .addCase(updateVideo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update video";
      })
      .addCase(deleteVideo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVideo.fulfilled, (state, action) => {
        state.loading = false;
        state.videos = state.videos.filter((video) => video.id !== action.payload);
        state.totalVideos = Math.max(0, state.totalVideos - 1);
      })
      .addCase(deleteVideo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete video";
      })
      .addCase(searchTMDb.rejected, (state, action) => {
        state.error = action.error.message || "Failed to search TMDb";
      })
      .addCase(fetchTMDbDetails.rejected, (state, action) => {
        state.error = action.error.message || "Failed to fetch TMDb details";
      })
      .addCase(bulkUpdateVideos.rejected, (state, action) => {
        state.error = action.error.message || "Failed to start bulk update";
      });
  },
});

export const { setCurrentPage, setVideosPerPage, setYearFilter, setActorFilter, setGenreFilter, setRuntimeFilter, setRatingFilter, setSearchQuery, setSortBy, setSortOrder, clearFilters, clearError, addVideoToList, updateVideoInList, removeVideoFromList } = videosSlice.actions;

export default videosSlice.reducer;
