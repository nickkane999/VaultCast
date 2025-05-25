import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchVideos,
  createVideoRecord,
  updateVideoRecord,
  deleteVideoRecord,
  setCurrentPage,
  setYearFilter,
  setActorFilter,
  setGenreFilter,
  setRuntimeFilter,
  setRatingFilter,
  setSortBy,
  setSortOrder,
  setShowCreateForm,
  setEditingVideoId,
  updateEditForm,
  clearEditForm,
  setError,
} from "@/store/videosSlice";
import { VideoFormData } from "./types";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useCallback } from "react";

export const useVideos = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { videos, currentPage, videosPerPage, totalVideos, yearFilter, actorFilter, genreFilter, runtimeFilter, ratingFilter, sortBy, sortOrder, loading, error, showCreateForm, editingVideoId, editForm } = useSelector((state: RootState) => state.videos);

  const totalPages = Math.ceil(totalVideos / videosPerPage);

  // Parse URL parameters into filter state
  const getFiltersFromURL = useCallback(() => {
    const urlPage = parseInt(searchParams.get("page") || "1");
    const urlYear = searchParams.get("year");
    const urlActor = searchParams.get("actor");
    const urlGenre = searchParams.get("genre");
    const urlRuntimeMin = searchParams.get("runtimeMin") ? parseInt(searchParams.get("runtimeMin")!) : null;
    const urlRuntimeMax = searchParams.get("runtimeMax") ? parseInt(searchParams.get("runtimeMax")!) : null;
    const urlRatingMin = searchParams.get("ratingMin") ? parseFloat(searchParams.get("ratingMin")!) : null;
    const urlRatingMax = searchParams.get("ratingMax") ? parseFloat(searchParams.get("ratingMax")!) : null;
    const urlSortBy = (searchParams.get("sortBy") as "rank" | "release_date") || "release_date";
    const urlSortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

    return {
      page: urlPage,
      yearFilter: urlYear,
      actorFilter: urlActor,
      genreFilter: urlGenre,
      runtimeMin: urlRuntimeMin,
      runtimeMax: urlRuntimeMax,
      ratingMin: urlRatingMin,
      ratingMax: urlRatingMax,
      sortBy: urlSortBy,
      sortOrder: urlSortOrder,
    };
  }, [searchParams]);

  // Update URL with current filter state
  const updateURL = useCallback(
    (newParams: { page?: number; yearFilter?: string | null; actorFilter?: string | null; genreFilter?: string | null; runtimeMin?: number | null; runtimeMax?: number | null; ratingMin?: number | null; ratingMax?: number | null; sortBy?: string; sortOrder?: string }) => {
      const params = new URLSearchParams(searchParams);

      // Update or remove parameters - map internal names to URL parameter names
      const urlParamMap: Record<string, string> = {
        yearFilter: "year",
        actorFilter: "actor",
        genreFilter: "genre",
      };

      Object.entries(newParams).forEach(([key, value]) => {
        const urlParamName = urlParamMap[key] || key;

        if (value === null || value === undefined || value === "") {
          params.delete(urlParamName);
        } else if (typeof value === "number" || value !== "") {
          params.set(urlParamName, value.toString());
        }
      });

      // Always ensure page is set to 1 when filters change (except when explicitly setting page)
      if (!("page" in newParams) && ("yearFilter" in newParams || "actorFilter" in newParams || "genreFilter" in newParams || "runtimeMin" in newParams || "runtimeMax" in newParams || "ratingMin" in newParams || "ratingMax" in newParams)) {
        params.set("page", "1");
      }

      const newURL = `${pathname}?${params.toString()}`;
      router.replace(newURL);
    },
    [searchParams, pathname, router]
  );

  // Main fetch function that reads from URL state
  const handleFetchVideos = useCallback(() => {
    const urlFilters = getFiltersFromURL();

    dispatch(
      fetchVideos({
        page: urlFilters.page,
        limit: videosPerPage,
        yearFilter: urlFilters.yearFilter || undefined,
        actorFilter: urlFilters.actorFilter || undefined,
        genreFilter: urlFilters.genreFilter || undefined,
        runtimeMin: urlFilters.runtimeMin || undefined,
        runtimeMax: urlFilters.runtimeMax || undefined,
        ratingMin: urlFilters.ratingMin || undefined,
        ratingMax: urlFilters.ratingMax || undefined,
        sortBy: urlFilters.sortBy,
        sortOrder: urlFilters.sortOrder,
      })
    );

    // Sync Redux state with URL state
    dispatch(setCurrentPage(urlFilters.page));
    dispatch(setYearFilter(urlFilters.yearFilter));
    dispatch(setActorFilter(urlFilters.actorFilter));
    dispatch(setGenreFilter(urlFilters.genreFilter));
    dispatch(setRuntimeFilter({ min: urlFilters.runtimeMin, max: urlFilters.runtimeMax }));
    dispatch(setRatingFilter({ min: urlFilters.ratingMin, max: urlFilters.ratingMax }));
    dispatch(setSortBy(urlFilters.sortBy));
    dispatch(setSortOrder(urlFilters.sortOrder));
  }, [dispatch, getFiltersFromURL, videosPerPage]);

  // Fetch videos when URL parameters change
  useEffect(() => {
    handleFetchVideos();
  }, [searchParams, handleFetchVideos]);

  const handlePageChange = (page: number) => {
    updateURL({ page });
  };

  const handleYearFilterChange = (year: string | null) => {
    updateURL({ yearFilter: year });
  };

  const handleActorFilterChange = (actor: string | null) => {
    updateURL({ actorFilter: actor });
  };

  const handleGenreFilterChange = (genre: string | null) => {
    updateURL({ genreFilter: genre });
  };

  const handleRuntimeFilterChange = (min: number | null, max: number | null) => {
    updateURL({ runtimeMin: min, runtimeMax: max });
  };

  const handleRatingFilterChange = (min: number | null, max: number | null) => {
    updateURL({ ratingMin: min, ratingMax: max });
  };

  const handleFilterChange = (filterType: string, value: any) => {
    switch (filterType) {
      case "year":
        updateURL({ yearFilter: value });
        break;
      case "actor":
        updateURL({ actorFilter: value });
        break;
      case "genre":
        updateURL({ genreFilter: value });
        break;
      case "runtimeMin":
        updateURL({ runtimeMin: value });
        break;
      case "runtimeMax":
        updateURL({ runtimeMax: value });
        break;
      case "ratingMin":
        updateURL({ ratingMin: value });
        break;
      case "ratingMax":
        updateURL({ ratingMax: value });
        break;
    }
  };

  const handleBatchFilterUpdate = (filters: { year?: string | null; actor?: string | null; genre?: string | null; runtimeMin?: number | null; runtimeMax?: number | null; ratingMin?: number | null; ratingMax?: number | null }) => {
    updateURL({
      yearFilter: filters.year,
      actorFilter: filters.actor,
      genreFilter: filters.genre,
      runtimeMin: filters.runtimeMin,
      runtimeMax: filters.runtimeMax,
      ratingMin: filters.ratingMin,
      ratingMax: filters.ratingMax,
    });
  };

  const handleClearFilters = () => {
    updateURL({
      yearFilter: null,
      actorFilter: null,
      genreFilter: null,
      runtimeMin: null,
      runtimeMax: null,
      ratingMin: null,
      ratingMax: null,
    });
  };

  const handleSortChange = (newSortBy: "rank" | "release_date", newSortOrder?: "asc" | "desc") => {
    const actualSortOrder = newSortOrder || (newSortBy === sortBy && sortOrder === "desc" ? "asc" : "desc");
    updateURL({ sortBy: newSortBy, sortOrder: actualSortOrder });
  };

  const handleShowCreateForm = (videoFilename?: string) => {
    dispatch(setEditingVideoId(null));
    dispatch(setShowCreateForm(true));
    dispatch(clearEditForm());
    if (videoFilename) {
      dispatch(updateEditForm({ filename: videoFilename } as any));
    }
  };

  const handleEditVideo = (videoId: string) => {
    const video = videos.find((v) => v.id === videoId);
    if (video) {
      dispatch(setEditingVideoId(videoId));
      dispatch(setShowCreateForm(true));
      dispatch(
        updateEditForm({
          title: video.title || "",
          description: video.description || "",
          score: video.score || 0,
          release_date: video.release_date || "",
        })
      );
    }
  };

  const handleCancelForm = () => {
    dispatch(setShowCreateForm(false));
    dispatch(setEditingVideoId(null));
    dispatch(clearEditForm());
  };

  const handleCreateVideo = (videoData: VideoFormData & { filename: string }) => {
    dispatch(createVideoRecord(videoData)).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        handleFetchVideos();
      }
    });
  };

  const handleUpdateVideo = (videoData: VideoFormData) => {
    if (editingVideoId) {
      dispatch(updateVideoRecord({ id: editingVideoId, videoData })).then((result) => {
        if (result.meta.requestStatus === "fulfilled") {
          handleFetchVideos();
        }
      });
    }
  };

  const handleDeleteVideo = (videoId: string) => {
    if (confirm("Are you sure you want to delete this video record?")) {
      dispatch(deleteVideoRecord(videoId)).then((result) => {
        if (result.meta.requestStatus === "fulfilled") {
          handleFetchVideos();
        }
      });
    }
  };

  const handleVideoCardClick = (video: any) => {
    if (video.id && !video.id.startsWith("temp_")) {
      router.push(`/videos/${video.id}`);
    }
  };

  const handleClearError = () => {
    dispatch(setError(null));
  };

  const getAvailableYears = () => {
    const years = new Set<number>();
    videos.forEach((video) => {
      if (video.release_date) {
        const year = new Date(video.release_date).getFullYear();
        if (!isNaN(year)) {
          years.add(year);
        }
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  };

  const getFilterOptions = () => {
    const actors = new Set<string>();
    const genres = new Set<string>();
    const years = new Set<string>();

    videos.forEach((video) => {
      if (video.actors) {
        video.actors.forEach((actor) => actors.add(actor));
      }
      if (video.genres) {
        video.genres.forEach((genre) => genres.add(genre));
      }
      if (video.release_date) {
        const year = new Date(video.release_date).getFullYear();
        if (!isNaN(year)) {
          years.add(year.toString());
        }
      }
    });

    return {
      actors: Array.from(actors).sort(),
      genres: Array.from(genres).sort(),
      years: Array.from(years).sort((a, b) => parseInt(b) - parseInt(a)),
    };
  };

  return {
    videos,
    currentPage,
    totalPages,
    totalVideos,
    yearFilter,
    actorFilter,
    genreFilter,
    runtimeFilter,
    ratingFilter,
    sortBy,
    sortOrder,
    loading,
    error,
    showCreateForm,
    editingVideoId,
    editForm,
    availableYears: getAvailableYears(),
    filterOptions: getFilterOptions(),
    handleFetchVideos,
    handlePageChange,
    handleYearFilterChange,
    handleActorFilterChange,
    handleGenreFilterChange,
    handleRuntimeFilterChange,
    handleRatingFilterChange,
    handleFilterChange,
    handleBatchFilterUpdate,
    handleClearFilters,
    handleSortChange,
    handleShowCreateForm,
    handleEditVideo,
    handleCancelForm,
    handleCreateVideo,
    handleUpdateVideo,
    handleDeleteVideo,
    handleVideoCardClick,
    handleClearError,
  };
};
