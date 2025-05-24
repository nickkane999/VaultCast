import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchVideos, createVideoRecord, updateVideoRecord, deleteVideoRecord, setCurrentPage, setYearFilter, setSortBy, setSortOrder, setShowCreateForm, setEditingVideoId, updateEditForm, clearEditForm, setError } from "@/store/videosSlice";
import { VideoFormData } from "./types";
import { useRouter } from "next/navigation";

export const useVideos = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { videos, currentPage, videosPerPage, totalVideos, yearFilter, sortBy, sortOrder, loading, error, showCreateForm, editingVideoId, editForm } = useSelector((state: RootState) => state.videos);

  const totalPages = Math.ceil(totalVideos / videosPerPage);

  const handleFetchVideos = (params?: { page?: number; yearFilter?: string; sortBy?: string; sortOrder?: string }) => {
    dispatch(
      fetchVideos({
        page: params?.page || currentPage,
        limit: videosPerPage,
        yearFilter: params?.yearFilter !== undefined ? params.yearFilter : yearFilter || undefined,
        sortBy: params?.sortBy || sortBy,
        sortOrder: params?.sortOrder || sortOrder,
      })
    );
  };

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
    handleFetchVideos({ page });
  };

  const handleYearFilterChange = (year: string | null) => {
    dispatch(setYearFilter(year));
    handleFetchVideos({ page: 1, yearFilter: year || undefined });
  };

  const handleSortChange = (newSortBy: "rank" | "release_date", newSortOrder?: "asc" | "desc") => {
    const actualSortOrder = newSortOrder || (newSortBy === sortBy && sortOrder === "desc" ? "asc" : "desc");
    dispatch(setSortBy(newSortBy));
    dispatch(setSortOrder(actualSortOrder));
    handleFetchVideos({ page: 1, sortBy: newSortBy, sortOrder: actualSortOrder });
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

  return {
    videos,
    currentPage,
    totalPages,
    totalVideos,
    yearFilter,
    sortBy,
    sortOrder,
    loading,
    error,
    showCreateForm,
    editingVideoId,
    editForm,
    availableYears: getAvailableYears(),
    handleFetchVideos,
    handlePageChange,
    handleYearFilterChange,
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
