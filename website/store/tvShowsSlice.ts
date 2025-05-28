import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface TVEpisodeRecord {
  id: string;
  filename: string;
  title?: string;
  description?: string;
  score?: number;
  air_date?: string;
  season_number?: number;
  episode_number?: number;
  show_name?: string;
  runtime?: number;
  genres?: string[];
  cast?: string[];
  actors?: string[];
  keywords?: string[];
  poster_path?: string;
  backdrop_path?: string;
  vote_average?: number;
  vote_count?: number;
  tmdb_id?: number;
  imdb_id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TVShowInfo {
  name: string;
  seasons: TVSeasonInfo[];
  totalEpisodes: number;
}

export interface TVSeasonInfo {
  seasonNumber: number;
  episodes: TVEpisodeRecord[];
  episodeCount: number;
}

export interface TVEpisodeFormData {
  title: string;
  description: string;
  score: number;
  air_date: string;
  season_number: number;
  episode_number: number;
  show_name: string;
  runtime?: number;
  genres?: string[];
  actors?: string[];
  keywords?: string[];
  poster_path?: string;
  backdrop_path?: string;
  vote_average?: number;
  vote_count?: number;
  tmdb_id?: number;
  imdb_id?: string;
}

interface TVShowsState {
  shows: TVShowInfo[];
  episodes: TVEpisodeRecord[];
  currentPage: number;
  episodesPerPage: number;
  totalEpisodes: number;
  showFilter: string | null;
  seasonFilter: number | null;
  yearFilter: string | null;
  actorFilter: string[] | null;
  genreFilter: string[] | null;
  runtimeFilter: { min: number | null; max: number | null };
  ratingFilter: { min: number | null; max: number | null };
  showUnrecordedFilter: boolean | null;
  searchQuery: string | null;
  sortBy: "air_date" | "episode_number" | "rating";
  sortOrder: "asc" | "desc";
  loading: boolean;
  error: string | null;
  showCreateForm: boolean;
  editingEpisodeId: string | null;
  editForm: {
    title: string;
    description: string;
    score: number;
    air_date: string;
    season_number: number;
    episode_number: number;
    show_name: string;
  };
  filterOptions: {
    shows: string[];
    actors: string[];
    genres: string[];
    years: string[];
  };
}

const initialState: TVShowsState = {
  shows: [],
  episodes: [],
  currentPage: 1,
  episodesPerPage: 12,
  totalEpisodes: 0,
  showFilter: null,
  seasonFilter: null,
  yearFilter: null,
  actorFilter: null,
  genreFilter: null,
  runtimeFilter: { min: null, max: null },
  ratingFilter: { min: null, max: null },
  showUnrecordedFilter: null,
  searchQuery: null,
  sortBy: "air_date",
  sortOrder: "asc",
  loading: false,
  error: null,
  showCreateForm: false,
  editingEpisodeId: null,
  editForm: {
    title: "",
    description: "",
    score: 0,
    air_date: "",
    season_number: 1,
    episode_number: 1,
    show_name: "",
  },
  filterOptions: {
    shows: [],
    actors: [],
    genres: [],
    years: [],
  },
};

export const fetchTVShows = createAsyncThunk(
  "tvShows/fetchTVShows",
  async (
    params: {
      page?: number;
      limit?: number;
      showFilter?: string;
      seasonFilter?: number;
      yearFilter?: string;
      actorFilter?: string[] | string;
      genreFilter?: string[] | string;
      runtimeMin?: number;
      runtimeMax?: number;
      ratingMin?: number;
      ratingMax?: number;
      showUnrecorded?: boolean;
      searchQuery?: string;
      sortBy?: string;
      sortOrder?: string;
    } = {}
  ) => {
    const { page = 1, limit = 12, showFilter, seasonFilter, yearFilter, actorFilter, genreFilter, runtimeMin, runtimeMax, ratingMin, ratingMax, showUnrecorded, searchQuery, sortBy = "air_date", sortOrder = "desc" } = params;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:3000";
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
    });

    if (showFilter) searchParams.append("show", showFilter);
    if (seasonFilter !== undefined && seasonFilter !== null) searchParams.append("season", seasonFilter.toString());
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
    if (showUnrecorded !== undefined && showUnrecorded !== null) searchParams.append("showUnrecorded", showUnrecorded.toString());
    if (searchQuery) searchParams.append("search", searchQuery);

    const response = await fetch(`${baseUrl}/api/videos/tv?${searchParams}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
);

export const createTVEpisodeRecord = createAsyncThunk("tvShows/createTVEpisodeRecord", async (episodeData: TVEpisodeFormData & { filename: string }) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:3000";
  const response = await fetch(`${baseUrl}/api/videos/tv`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(episodeData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create TV episode record");
  }
  return response.json();
});

export const updateTVEpisodeRecord = createAsyncThunk("tvShows/updateTVEpisodeRecord", async (params: { id: string; episodeData: TVEpisodeFormData }) => {
  const { id, episodeData } = params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:3000";
  const response = await fetch(`${baseUrl}/api/videos/tv/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(episodeData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update TV episode record");
  }
  return response.json();
});

export const deleteTVEpisodeRecord = createAsyncThunk("tvShows/deleteTVEpisodeRecord", async (episodeId: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:3000";
  const response = await fetch(`${baseUrl}/api/videos/tv/${episodeId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete TV episode record");
  }
  return { id: episodeId };
});

const tvShowsSlice = createSlice({
  name: "tvShows",
  initialState,
  reducers: {
    setShows: (state, action: PayloadAction<TVShowInfo[]>) => {
      state.shows = action.payload;
    },
    setEpisodes: (state, action: PayloadAction<TVEpisodeRecord[]>) => {
      state.episodes = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setShowFilter: (state, action: PayloadAction<string | null>) => {
      state.showFilter = action.payload;
      state.currentPage = 1;
    },
    setSeasonFilter: (state, action: PayloadAction<number | null>) => {
      state.seasonFilter = action.payload;
      state.currentPage = 1;
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
    setShowUnrecordedFilter: (state, action: PayloadAction<boolean | null>) => {
      state.showUnrecordedFilter = action.payload;
      state.currentPage = 1;
    },
    setSearchQuery: (state, action: PayloadAction<string | null>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1;
    },
    setSortBy: (state, action: PayloadAction<"air_date" | "episode_number" | "rating">) => {
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
    setEditingEpisodeId: (state, action: PayloadAction<string | null>) => {
      state.editingEpisodeId = action.payload;
    },
    updateEditForm: (state, action: PayloadAction<Partial<TVEpisodeFormData>>) => {
      state.editForm = { ...state.editForm, ...action.payload };
    },
    clearEditForm: (state) => {
      state.editForm = {
        title: "",
        description: "",
        score: 0,
        air_date: "",
        season_number: 1,
        episode_number: 1,
        show_name: "",
      };
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setFilterOptions: (state, action: PayloadAction<{ shows: string[]; actors: string[]; genres: string[]; years: string[] }>) => {
      state.filterOptions = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTVShows.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTVShows.fulfilled, (state, action) => {
        state.loading = false;
        state.episodes = action.payload.episodes;
        state.shows = action.payload.shows;
        state.totalEpisodes = action.payload.totalEpisodes;
        state.currentPage = action.payload.currentPage;
        if (action.payload.filterOptions) {
          state.filterOptions = action.payload.filterOptions;
        }
      })
      .addCase(fetchTVShows.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch TV shows";
      })
      .addCase(createTVEpisodeRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTVEpisodeRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.episodes.push(action.payload);
        state.showCreateForm = false;
        state.totalEpisodes += 1;
      })
      .addCase(createTVEpisodeRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create TV episode record";
      })
      .addCase(updateTVEpisodeRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTVEpisodeRecord.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.episodes.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.episodes[index] = action.payload;
        }
        state.editingEpisodeId = null;
        state.showCreateForm = false;
      })
      .addCase(updateTVEpisodeRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update TV episode record";
      })
      .addCase(deleteTVEpisodeRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTVEpisodeRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.episodes = state.episodes.filter((e) => e.id !== action.payload.id);
        state.totalEpisodes -= 1;
      })
      .addCase(deleteTVEpisodeRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete TV episode record";
      });
  },
});

export const {
  setShows,
  setEpisodes,
  setCurrentPage,
  setShowFilter,
  setSeasonFilter,
  setYearFilter,
  setActorFilter,
  setGenreFilter,
  setRuntimeFilter,
  setRatingFilter,
  setShowUnrecordedFilter,
  setSearchQuery,
  setSortBy,
  setSortOrder,
  setShowCreateForm,
  setEditingEpisodeId,
  updateEditForm,
  clearEditForm,
  setError,
  setFilterOptions,
} = tvShowsSlice.actions;

export default tvShowsSlice.reducer;
