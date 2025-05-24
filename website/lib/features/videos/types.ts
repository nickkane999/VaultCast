export interface VideoRecord {
  id: string;
  filename: string;
  title?: string;
  description?: string;
  score?: number;
  release_date?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VideoFormData {
  title: string;
  description: string;
  score: number;
  release_date: string;
}

export interface VideoListState {
  videos: VideoRecord[];
  currentPage: number;
  videosPerPage: number;
  totalVideos: number;
  yearFilter: string | null;
  sortBy: "rank" | "release_date";
  sortOrder: "asc" | "desc";
  loading: boolean;
  error: string | null;
}

export interface VideoFormProps {
  video?: VideoRecord;
  onSubmit: (data: VideoFormData) => void;
  onCancel: () => void;
  mode: "create" | "edit";
}

export interface VideoCardProps {
  video: VideoRecord;
  onEditClick: () => void;
  onCardClick: () => void;
}
