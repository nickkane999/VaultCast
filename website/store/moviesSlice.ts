import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface MovieRecord {
  id: string;
  filename: string;
  title?: string;
  description?: string;
  score?: number;
  release_date?: string;
  tagline?: string;
  runtime?: number;
  genres?: string[];
  cast?: string[];
  actors?: string[];
  keywords?: string[];
  poster_path?: string;
  backdrop_path?: string;
  production_companies?: string[];
  production_countries?: string[];
  spoken_languages?: string[];
  status?: string;
  vote_average?: number;
  vote_count?: number;
  tmdb_id?: number;
  imdb_id?: string;
  trailer_url?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MovieFormData {
  title: string;
  description: string;
  score: number;
  release_date: string;
  tagline?: string;
  runtime?: number;
  genres?: string[];
  actors?: string[];
  keywords?: string[];
  poster_path?: string;
  backdrop_path?: string;
  production_companies?: string[];
  production_countries?: string[];
  spoken_languages?: string[];
  status?: string;
  vote_average?: number;
  vote_count?: number;
  tmdb_id?: number;
  imdb_id?: string;
  trailer_url?: string;
}

interface MoviesState {
  movies: MovieRecord[];
  currentPage: number;
  moviesPerPage: number;
  totalMovies: number;
  yearFilter: string | null;
  actorFilter: string[] | null;
  genreFilter: string[] | null;
  runtimeFilter: { min: number | null; max: number | null };
  ratingFilter: { min: number | null; max: number | null };
  showUnrecordedFilter: boolean | null;
  searchQuery: string | null;
  sortBy: "rank" | "release_date";
  sortOrder: "asc" | "desc";
  loading: boolean;
  error: string | null;
  showCreateForm: boolean;
  editingMovieId: string | null;
  editForm: {
    title: string;
    description: string;
    score: number;
    release_date: string;
  };
  filterOptions: {
    actors: string[];
    genres: string[];
    years: string[];
  };
}

const initialState: MoviesState = {
  movies: [],
  currentPage: 1,
  moviesPerPage: 12,
  totalMovies: 0,
  yearFilter: null,
  actorFilter: null,
  genreFilter: null,
  runtimeFilter: { min: null, max: null },
  ratingFilter: { min: null, max: null },
  showUnrecordedFilter: null,
  searchQuery: null,
  sortBy: "release_date",
  sortOrder: "desc",
  loading: false,
  error: null,
  showCreateForm: false,
  editingMovieId: null,
  editForm: {
    title: "",
    description: "",
    score: 0,
    release_date: "",
  },
  filterOptions: {
    actors: [],
    genres: [],
    years: [],
  },
};

export const fetchMovies = createAsyncThunk(
  "movies/fetchMovies",
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
      showUnrecorded?: boolean;
      searchQuery?: string;
      sortBy?: string;
      sortOrder?: string;
    } = {}
  ) => {
    const { page = 1, limit = 12, yearFilter, actorFilter, genreFilter, runtimeMin, runtimeMax, ratingMin, ratingMax, showUnrecorded, searchQuery, sortBy = "release_date", sortOrder = "desc" } = params;

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
    if (showUnrecorded !== undefined && showUnrecorded !== null) searchParams.append("showUnrecorded", showUnrecorded.toString());
    if (searchQuery) searchParams.append("search", searchQuery);

    const response = await fetch(`${baseUrl}/api/videos/movies?${searchParams}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
);

export const createMovieRecord = createAsyncThunk("movies/createMovieRecord", async (movieData: MovieFormData & { filename: string }) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:3000";
  const response = await fetch(`${baseUrl}/api/videos/movies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(movieData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create movie record");
  }
  return response.json();
});

export const updateMovieRecord = createAsyncThunk("movies/updateMovieRecord", async (params: { id: string; movieData: MovieFormData }) => {
  const { id, movieData } = params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:3000";
  const response = await fetch(`${baseUrl}/api/videos/movies/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(movieData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update movie record");
  }
  return response.json();
});

export const deleteMovieRecord = createAsyncThunk("movies/deleteMovieRecord", async (movieId: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:3000";
  const response = await fetch(`${baseUrl}/api/videos/movies/${movieId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete movie record");
  }
  return { id: movieId };
});

const moviesSlice = createSlice({
  name: "movies",
  initialState,
  reducers: {
    setMovies: (state, action: PayloadAction<MovieRecord[]>) => {
      state.movies = action.payload;
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
    setShowUnrecordedFilter: (state, action: PayloadAction<boolean | null>) => {
      state.showUnrecordedFilter = action.payload;
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
    setEditingMovieId: (state, action: PayloadAction<string | null>) => {
      state.editingMovieId = action.payload;
    },
    updateEditForm: (state, action: PayloadAction<Partial<MovieFormData>>) => {
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
    setFilterOptions: (state, action: PayloadAction<{ actors: string[]; genres: string[]; years: string[] }>) => {
      state.filterOptions = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMovies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMovies.fulfilled, (state, action) => {
        state.loading = false;
        state.movies = action.payload.movies;
        state.totalMovies = action.payload.totalMovies;
        state.currentPage = action.payload.currentPage;
        if (action.payload.filterOptions) {
          state.filterOptions = action.payload.filterOptions;
        }
      })
      .addCase(fetchMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch movies";
      })
      .addCase(createMovieRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMovieRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.movies.push(action.payload);
        state.showCreateForm = false;
        state.totalMovies += 1;
      })
      .addCase(createMovieRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create movie record";
      })
      .addCase(updateMovieRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMovieRecord.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.movies.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) {
          state.movies[index] = action.payload;
        }
        state.editingMovieId = null;
        state.showCreateForm = false;
      })
      .addCase(updateMovieRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update movie record";
      })
      .addCase(deleteMovieRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMovieRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.movies = state.movies.filter((m) => m.id !== action.payload.id);
        state.totalMovies -= 1;
      })
      .addCase(deleteMovieRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete movie record";
      });
  },
});

export const { setMovies, setCurrentPage, setYearFilter, setActorFilter, setGenreFilter, setRuntimeFilter, setRatingFilter, setShowUnrecordedFilter, setSearchQuery, setSortBy, setSortOrder, setShowCreateForm, setEditingMovieId, updateEditForm, clearEditForm, setError, setFilterOptions } =
  moviesSlice.actions;

export default moviesSlice.reducer;
