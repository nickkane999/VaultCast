import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AdminState, BulkUpdateOptions, BulkUpdateProgress, TVShow, TVShowStatus, GmailAuthState, CollectionRenameState } from "../types";

const initialState: AdminState = {
  bulkUpdateProgress: null,
  isUpdating: false,
  tvShows: [],
  tvShowStatus: null,
  loadingShows: false,
  error: null,
  success: null,
  options: {
    updateTrailers: true,
    updateMissingInfo: true,
    overwriteExisting: false,
    batchSize: 5,
    contentType: "movies",
    showStatus: "all",
  },
};

export const fetchTVShows = createAsyncThunk("admin/fetchTVShows", async () => {
  const [statusResponse, showsResponse] = await Promise.all([fetch("/api/admin/tv-show-status"), fetch("/api/admin/scan-tv-shows")]);

  if (!statusResponse.ok || !showsResponse.ok) {
    throw new Error("Failed to fetch TV shows");
  }

  const statusData = await statusResponse.json();
  const showsData = await showsResponse.json();

  return {
    status: statusData,
    shows: showsData.shows || [],
  };
});

export const startBulkUpdate = createAsyncThunk("admin/startBulkUpdate", async (options: BulkUpdateOptions, { dispatch }) => {
  const response = await fetch("/api/admin/bulk-update-videos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response body");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.trim()) {
        try {
          const data = JSON.parse(line);
          if (data.type === "progress") {
            dispatch(updateProgress(data.data));
          } else if (data.type === "complete") {
            dispatch(bulkUpdateComplete(data.data));
          } else if (data.type === "error") {
            dispatch(bulkUpdateError(data.message));
          }
        } catch (e) {
          console.error("Error parsing SSE data:", e);
        }
      }
    }
  }
});

export const fetchCollections = createAsyncThunk("admin/fetchCollections", async () => {
  const response = await fetch("/api/admin/collections");
  if (!response.ok) {
    throw new Error("Failed to fetch collections");
  }
  return response.json();
});

export const renameCollection = createAsyncThunk("admin/renameCollection", async ({ oldName, newName }: { oldName: string; newName: string }) => {
  const response = await fetch("/api/admin/rename-collection", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ oldName, newName }),
  });

  if (!response.ok) {
    throw new Error("Failed to rename collection");
  }

  return response.json();
});

export const authenticateGmail = createAsyncThunk("admin/authenticateGmail", async () => {
  const response = await fetch("/api/admin/gmail-auth");
  if (!response.ok) {
    throw new Error("Failed to authenticate Gmail");
  }
  return response.json();
});

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    updateProgress: (state, action: PayloadAction<BulkUpdateProgress>) => {
      state.bulkUpdateProgress = action.payload;
    },
    bulkUpdateComplete: (state, action: PayloadAction<any>) => {
      state.isUpdating = false;
      state.success = `Bulk update completed! Updated ${action.payload.updated} videos, skipped ${action.payload.skipped}, failed ${action.payload.failed}.`;
      state.error = null;
    },
    bulkUpdateError: (state, action: PayloadAction<string>) => {
      state.isUpdating = false;
      state.error = action.payload;
      state.success = null;
    },
    updateOptions: (state, action: PayloadAction<Partial<BulkUpdateOptions>>) => {
      state.options = { ...state.options, ...action.payload };

      // Reset TV-specific options when switching content types
      if ("contentType" in action.payload) {
        state.options.selectedShow = undefined;
        state.options.selectedSeason = undefined;
        state.options.showStatus = "all";
      }

      // Reset season when changing show
      if ("selectedShow" in action.payload) {
        state.options.selectedSeason = undefined;
      }

      // Reset show and season when changing show status
      if ("showStatus" in action.payload) {
        state.options.selectedShow = undefined;
        state.options.selectedSeason = undefined;
      }
    },
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
    resetBulkUpdate: (state) => {
      state.bulkUpdateProgress = null;
      state.isUpdating = false;
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTVShows.pending, (state) => {
        state.loadingShows = true;
        state.error = null;
      })
      .addCase(fetchTVShows.fulfilled, (state, action) => {
        state.loadingShows = false;
        state.tvShowStatus = action.payload.status;
        state.tvShows = action.payload.shows;
      })
      .addCase(fetchTVShows.rejected, (state, action) => {
        state.loadingShows = false;
        state.error = action.error.message || "Failed to fetch TV shows";
      })
      .addCase(startBulkUpdate.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.success = null;
        state.bulkUpdateProgress = null;
      })
      .addCase(startBulkUpdate.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.error.message || "Bulk update failed";
      })
      .addCase(fetchCollections.fulfilled, (state, action) => {
        // Handle collections if needed
      })
      .addCase(renameCollection.fulfilled, (state, action) => {
        state.success = "Collection renamed successfully";
      })
      .addCase(authenticateGmail.fulfilled, (state, action) => {
        // Handle Gmail auth if needed
      });
  },
});

export const { updateProgress, bulkUpdateComplete, bulkUpdateError, updateOptions, clearMessages, resetBulkUpdate } = adminSlice.actions;

export default adminSlice.reducer;
