export interface BulkUpdateProgress {
  total: number;
  current: number;
  currentMovie: string;
  completed: string[];
  failed: string[];
  skipped: string[];
}

export interface BulkUpdateOptions {
  updateTrailers: boolean;
  updateMissingInfo: boolean;
  overwriteExisting: boolean;
  batchSize: number;
  contentType: "movies" | "tv";
  selectedShow?: string;
  selectedSeason?: number;
  showStatus?: "all" | "recorded" | "unrecorded";
}

export interface TVShow {
  name: string;
  seasons: Array<{
    seasonNumber: number;
    episodeCount: number;
    recordedCount?: number;
    status?: "complete" | "partial" | "none";
  }>;
  status?: "complete" | "partial" | "none";
}

export interface TVShowStatus {
  recordedShows: TVShow[];
  unrecordedShows: TVShow[];
  summary: {
    totalShows: number;
    recordedShows: number;
    unrecordedShows: number;
    completeShows: number;
    partialShows: number;
  };
}

export interface AdminState {
  bulkUpdateProgress: BulkUpdateProgress | null;
  isUpdating: boolean;
  tvShows: TVShow[];
  tvShowStatus: TVShowStatus | null;
  loadingShows: boolean;
  error: string | null;
  success: string | null;
  options: BulkUpdateOptions;
}

export interface GmailAuthState {
  isAuthenticated: boolean;
  email: string | null;
  loading: boolean;
  error: string | null;
}

export interface CollectionRenameState {
  collections: string[];
  loading: boolean;
  error: string | null;
  success: string | null;
}
