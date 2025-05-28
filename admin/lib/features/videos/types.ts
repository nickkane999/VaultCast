export interface VideoRecord {
  id: string;
  filename: string;
  title?: string;
  description?: string;
  score?: number;
  release_date?: string;
  air_date?: string;
  season_number?: number;
  episode_number?: number;
  show_name?: string;
  tmdb_id?: number;
  imdb_id?: string;
  tagline?: string;
  runtime?: number;
  genres?: string[];
  cast?: CastMember[];
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
  trailer_url?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CastMember {
  name: string;
  character: string;
  profile_path?: string;
}

export interface VideoFormData {
  filename?: string; // Include filename to preserve it during updates
  title: string;
  description: string;
  score: number;
  release_date: string;
  air_date?: string;
  season_number?: number;
  episode_number?: number;
  show_name?: string;
  tagline?: string;
  runtime?: number;
  genres?: string[];
  cast?: CastMember[];
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

export interface TMDbMovieData {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  runtime: number;
  tagline: string;
  status: string;
  imdb_id: string;
  genres: { id: number; name: string }[];
  production_companies: { id: number; name: string }[];
  production_countries: { iso_3166_1: string; name: string }[];
  spoken_languages: { iso_639_1: string; name: string }[];
  poster_path: string;
  backdrop_path: string;
  keywords: { keywords: { id: number; name: string }[] };
  credits: {
    cast: {
      name: string;
      character: string;
      profile_path: string;
    }[];
  };
  videos: {
    results: {
      key: string;
      name: string;
      site: string;
      type: string;
      official: boolean;
    }[];
  };
}

export interface VideoListState {
  videos: VideoRecord[];
  currentPage: number;
  videosPerPage: number;
  totalVideos: number;
  yearFilter: string | null;
  actorFilter: string[] | null;
  genreFilter: string[] | null;
  runtimeFilter: { min: number | null; max: number | null };
  ratingFilter: { min: number | null; max: number | null };
  searchQuery: string | null;
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
  type: "movie" | "tv";
}

export interface VideoCardProps {
  video: VideoRecord;
  onEditClick: () => void;
  onCardClick: () => void;
}
