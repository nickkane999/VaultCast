import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { VideoRecord, VideoFormData, VideoListState } from "@/lib/features/videos/types";

interface VideosState extends VideoListState {
  showCreateForm: boolean;
  editingVideoId: string | null;
  editForm: {
    title: string;
    description: string;
    score: number;
    release_date: string;
  };
}

const initialState: VideosState = {
  videos: [],
  currentPage: 1,
  videosPerPage: 12,
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
  showCreateForm: false,
  editingVideoId: null,
  editForm: {
    title: "",
    description: "",
    score: 0,
    release_date: "",
  },
};

export const fetchVideos = createAsyncThunk(
  "videos/fetchVideos",
  async (
    params: {
      page?: number;
      limit?: number;
      yearFilter?: string;
      actorFilter?: string[] | string;
      genreFilter?: string[] | string;
      runtimeMin?: number;
      runtimeMax?: number;
      ratingMin?: number;
      ratingMax?: number;
      searchQuery?: string;
      sortBy?: string;
      sortOrder?: string;
    } = {}
  ) => {
    const { page = 1, limit = 12, yearFilter, actorFilter, genreFilter, runtimeMin, runtimeMax, ratingMin, ratingMax, searchQuery, sortBy = "release_date", sortOrder = "desc" } = params;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:3000";
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
    });

    if (yearFilter) searchParams.append("year", yearFilter);
    if (actorFilter) {
      const actorString = Array.isArray(actorFilter) ? actorFilter.join(",") : actorFilter;
      searchParams.append("actor", actorString);
    }
    if (genreFilter) {
      const genreString = Array.isArray(genreFilter) ? genreFilter.join(",") : genreFilter;
      searchParams.append("genre", genreString);
    }
    if (runtimeMin !== undefined && runtimeMin !== null) searchParams.append("runtimeMin", runtimeMin.toString());
    if (runtimeMax !== undefined && runtimeMax !== null) searchParams.append("runtimeMax", runtimeMax.toString());
    if (ratingMin !== undefined && ratingMin !== null) searchParams.append("ratingMin", ratingMin.toString());
    if (ratingMax !== undefined && ratingMax !== null) searchParams.append("ratingMax", ratingMax.toString());
    if (searchQuery) searchParams.append("search", searchQuery);

    const response = await fetch(`${baseUrl}/api/videos?${searchParams}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
);

export const createVideoRecord = createAsyncThunk("videos/createVideoRecord", async (videoData: VideoFormData & { filename: string }) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:3000";
  const response = await fetch(`${baseUrl}/api/videos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(videoData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create video record");
  }
  return response.json();
});

export const updateVideoRecord = createAsyncThunk("videos/updateVideoRecord", async (params: { id: string; videoData: VideoFormData }) => {
  const { id, videoData } = params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:3000";
  const response = await fetch(`${baseUrl}/api/videos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(videoData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update video record");
  }
  return response.json();
});

export const deleteVideoRecord = createAsyncThunk("videos/deleteVideoRecord", async (videoId: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:3000";
  const response = await fetch(`${baseUrl}/api/videos/${videoId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete video record");
  }
  return { id: videoId };
});

const videosSlice = createSlice({
  name: "videos",
  initialState,
  reducers: {
    setVideos: (state, action: PayloadAction<VideoRecord[]>) => {
      state.videos = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
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
      state.currentPage = 1;
    },
    setSortOrder: (state, action: PayloadAction<"asc" | "desc">) => {
      state.sortOrder = action.payload;
      state.currentPage = 1;
    },
    setShowCreateForm: (state, action: PayloadAction<boolean>) => {
      state.showCreateForm = action.payload;
    },
    setEditingVideoId: (state, action: PayloadAction<string | null>) => {
      state.editingVideoId = action.payload;
    },
    updateEditForm: (state, action: PayloadAction<Partial<VideoFormData>>) => {
      state.editForm = { ...state.editForm, ...action.payload };
    },
    clearEditForm: (state) => {
      state.editForm = {
        title: "",
        description: "",
        score: 0,
        release_date: "",
      };
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
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
        state.videos = action.payload.videos;
        state.totalVideos = action.payload.totalVideos;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch videos";
      })
      .addCase(createVideoRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVideoRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.videos.push(action.payload);
        state.showCreateForm = false;
        state.totalVideos += 1;
      })
      .addCase(createVideoRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create video record";
      })
      .addCase(updateVideoRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVideoRecord.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.videos.findIndex((v) => v.id === action.payload.id);
        if (index !== -1) {
          state.videos[index] = action.payload;
        }
        state.editingVideoId = null;
        state.showCreateForm = false;
      })
      .addCase(updateVideoRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update video record";
      })
      .addCase(deleteVideoRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVideoRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.videos = state.videos.filter((v) => v.id !== action.payload.id);
        state.totalVideos -= 1;
      })
      .addCase(deleteVideoRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete video record";
      });
  },
});

export const { setVideos, setCurrentPage, setYearFilter, setActorFilter, setGenreFilter, setRuntimeFilter, setRatingFilter, setSearchQuery, setSortBy, setSortOrder, setShowCreateForm, setEditingVideoId, updateEditForm, clearEditForm, setError } = videosSlice.actions;

export default videosSlice.reducer;
