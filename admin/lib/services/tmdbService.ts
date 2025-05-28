import axios from "axios";
import { TMDbMovieData, VideoFormData } from "@/lib/features/videos/types";

const TMDB_ACCESS_TOKEN = process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export class TMDbService {
  private static instance: TMDbService;

  static getInstance(): TMDbService {
    if (!TMDbService.instance) {
      TMDbService.instance = new TMDbService();
    }
    return TMDbService.instance;
  }

  private getAuthHeaders() {
    if (!TMDB_ACCESS_TOKEN) {
      throw new Error("TMDb Access Token not configured. Please add NEXT_PUBLIC_TMDB_ACCESS_TOKEN to your .env.local file.");
    }

    return {
      Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    };
  }

  async searchMovies(query: string): Promise<any[]> {
    try {
      console.log("Searching TMDb for:", query);
      console.log("Access Token configured:", !!TMDB_ACCESS_TOKEN);

      const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
        headers: this.getAuthHeaders(),
        params: {
          query: query,
          language: "en-US",
          page: 1,
        },
      });

      console.log("TMDb search results:", response.data.results?.length || 0, "movies found");
      return response.data.results || [];
    } catch (error) {
      console.error("Error searching TMDb:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error("TMDb authentication failed. Please check your Access Token.");
        }
        throw new Error(`TMDb API error: ${error.response?.status} - ${error.response?.statusText}`);
      }
      throw new Error("Failed to search movies");
    }
  }

  async searchTVShows(query: string): Promise<any[]> {
    try {
      console.log("Searching TMDb for TV shows:", query);
      console.log("Access Token configured:", !!TMDB_ACCESS_TOKEN);

      const response = await axios.get(`${TMDB_BASE_URL}/search/tv`, {
        headers: this.getAuthHeaders(),
        params: {
          query: query,
          language: "en-US",
          page: 1,
        },
      });

      console.log("TMDb search results:", response.data.results?.length || 0, "TV shows found");
      return response.data.results || [];
    } catch (error) {
      console.error("Error searching TMDb TV shows:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error("TMDb authentication failed. Please check your Access Token.");
        }
        throw new Error(`TMDb API error: ${error.response?.status} - ${error.response?.statusText}`);
      }
      throw new Error("Failed to search TV shows");
    }
  }

  async getMovieDetails(movieId: number): Promise<TMDbMovieData> {
    try {
      console.log("Fetching details for TMDb movie ID:", movieId);

      const [movieResponse, creditsResponse, keywordsResponse, videosResponse] = await Promise.all([
        axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
          headers: this.getAuthHeaders(),
          params: {
            language: "en-US",
          },
        }),
        axios.get(`${TMDB_BASE_URL}/movie/${movieId}/credits`, {
          headers: this.getAuthHeaders(),
        }),
        axios.get(`${TMDB_BASE_URL}/movie/${movieId}/keywords`, {
          headers: this.getAuthHeaders(),
        }),
        axios.get(`${TMDB_BASE_URL}/movie/${movieId}/videos`, {
          headers: this.getAuthHeaders(),
          params: {
            language: "en-US",
          },
        }),
      ]);

      console.log("Successfully fetched movie details for:", movieResponse.data.title);

      return {
        ...movieResponse.data,
        credits: creditsResponse.data,
        keywords: keywordsResponse.data,
        videos: videosResponse.data,
      };
    } catch (error) {
      console.error("Error fetching movie details:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error("TMDb authentication failed. Please check your Access Token.");
        }
        throw new Error(`TMDb API error: ${error.response?.status} - ${error.response?.statusText}`);
      }
      throw new Error("Failed to fetch movie details");
    }
  }

  async getTVShowDetails(tvId: number): Promise<any> {
    try {
      console.log("Fetching details for TMDb TV show ID:", tvId);

      const [tvResponse, creditsResponse, keywordsResponse, videosResponse] = await Promise.all([
        axios.get(`${TMDB_BASE_URL}/tv/${tvId}`, {
          headers: this.getAuthHeaders(),
          params: {
            language: "en-US",
          },
        }),
        axios.get(`${TMDB_BASE_URL}/tv/${tvId}/credits`, {
          headers: this.getAuthHeaders(),
        }),
        axios.get(`${TMDB_BASE_URL}/tv/${tvId}/keywords`, {
          headers: this.getAuthHeaders(),
        }),
        axios.get(`${TMDB_BASE_URL}/tv/${tvId}/videos`, {
          headers: this.getAuthHeaders(),
          params: {
            language: "en-US",
          },
        }),
      ]);

      console.log("Successfully fetched TV show details for:", tvResponse.data.name);

      return {
        ...tvResponse.data,
        credits: creditsResponse.data,
        keywords: keywordsResponse.data,
        videos: videosResponse.data,
      };
    } catch (error) {
      console.error("Error fetching TV show details:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error("TMDb authentication failed. Please check your Access Token.");
        }
        throw new Error(`TMDb API error: ${error.response?.status} - ${error.response?.statusText}`);
      }
      throw new Error("Failed to fetch TV show details");
    }
  }

  async getTVEpisodeDetails(tvId: number, seasonNumber: number, episodeNumber: number): Promise<any> {
    try {
      console.log(`Fetching episode details for TMDb TV show ID: ${tvId}, Season: ${seasonNumber}, Episode: ${episodeNumber}`);

      const [episodeResponse, creditsResponse] = await Promise.all([
        axios.get(`${TMDB_BASE_URL}/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`, {
          headers: this.getAuthHeaders(),
          params: {
            language: "en-US",
          },
        }),
        axios.get(`${TMDB_BASE_URL}/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}/credits`, {
          headers: this.getAuthHeaders(),
        }),
      ]);

      console.log("Successfully fetched episode details for:", episodeResponse.data.name);

      return {
        ...episodeResponse.data,
        credits: creditsResponse.data,
      };
    } catch (error) {
      console.error("Error fetching TV episode details:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error("TMDb authentication failed. Please check your Access Token.");
        }
        if (error.response?.status === 404) {
          throw new Error(`Episode not found: Season ${seasonNumber}, Episode ${episodeNumber}`);
        }
        throw new Error(`TMDb API error: ${error.response?.status} - ${error.response?.statusText}`);
      }
      throw new Error("Failed to fetch TV episode details");
    }
  }

  private getTrailerUrl(videos: any): string | undefined {
    if (!videos?.results) return undefined;

    const trailer = videos.results.find((video: any) => video.type === "Trailer" && video.site === "YouTube" && video.official === true) || videos.results.find((video: any) => video.type === "Trailer" && video.site === "YouTube");

    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined;
  }

  transformToVideoFormData(tmdbData: TMDbMovieData): Partial<VideoFormData> {
    const castData =
      tmdbData.credits?.cast?.slice(0, 10).map((actor) => ({
        name: actor.name,
        character: actor.character,
        profile_path: actor.profile_path,
      })) || [];

    return {
      title: tmdbData.title,
      description: tmdbData.overview,
      release_date: tmdbData.release_date,
      score: Math.round(tmdbData.vote_average),
      tagline: tmdbData.tagline,
      runtime: tmdbData.runtime,
      genres: tmdbData.genres?.map((g) => g.name) || [],
      cast: castData,
      actors: castData.map((actor) => actor.name),
      keywords: tmdbData.keywords?.keywords?.map((k) => k.name) || [],
      poster_path: tmdbData.poster_path,
      backdrop_path: tmdbData.backdrop_path,
      production_companies: tmdbData.production_companies?.map((pc) => pc.name) || [],
      production_countries: tmdbData.production_countries?.map((pc) => pc.name) || [],
      spoken_languages: tmdbData.spoken_languages?.map((sl) => sl.name) || [],
      status: tmdbData.status,
      vote_average: tmdbData.vote_average,
      vote_count: tmdbData.vote_count,
      tmdb_id: tmdbData.id,
      imdb_id: tmdbData.imdb_id,
      trailer_url: this.getTrailerUrl(tmdbData.videos),
    };
  }

  transformTVShowToFormData(tmdbData: any): Partial<VideoFormData> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const castData =
      tmdbData.credits?.cast?.slice(0, 10).map((actor: any) => ({
        name: actor.name,
        character: actor.character,
        profile_path: actor.profile_path,
      })) || [];

    return {
      title: tmdbData.name,
      description: tmdbData.overview,
      air_date: tmdbData.first_air_date,
      show_name: tmdbData.name,
      score: Math.round(tmdbData.vote_average),
      tagline: tmdbData.tagline,
      runtime: tmdbData.episode_run_time?.[0] || 0,
      genres: tmdbData.genres?.map((g: any) => g.name) || [],
      cast: castData,
      actors: castData.map((actor: any) => actor.name),
      keywords: tmdbData.keywords?.results?.map((k: any) => k.name) || [],
      poster_path: tmdbData.poster_path,
      backdrop_path: tmdbData.backdrop_path,
      production_companies: tmdbData.production_companies?.map((pc: any) => pc.name) || [],
      production_countries: tmdbData.production_countries?.map((pc: any) => pc.name) || [],
      spoken_languages: tmdbData.spoken_languages?.map((sl: any) => sl.name) || [],
      status: tmdbData.status,
      vote_average: tmdbData.vote_average,
      vote_count: tmdbData.vote_count,
      tmdb_id: tmdbData.id,
      trailer_url: this.getTrailerUrl(tmdbData.videos),
    };
  }

  transformTVEpisodeToFormData(episodeData: any, showData: any): Partial<VideoFormData> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const castData =
      episodeData.credits?.cast?.slice(0, 10).map((actor: any) => ({
        name: actor.name,
        character: actor.character,
        profile_path: actor.profile_path,
      })) || [];

    return {
      title: episodeData.name,
      description: episodeData.overview,
      air_date: episodeData.air_date,
      show_name: showData.name,
      season_number: episodeData.season_number,
      episode_number: episodeData.episode_number,
      score: Math.round(episodeData.vote_average || showData.vote_average || 0),
      runtime: episodeData.runtime || showData.episode_run_time?.[0] || 0,
      genres: showData.genres?.map((g: any) => g.name) || [],
      cast: castData,
      actors: castData.map((actor: any) => actor.name),
      poster_path: episodeData.still_path || showData.poster_path,
      backdrop_path: showData.backdrop_path,
      production_companies: showData.production_companies?.map((pc: any) => pc.name) || [],
      production_countries: showData.production_countries?.map((pc: any) => pc.name) || [],
      spoken_languages: showData.spoken_languages?.map((sl: any) => sl.name) || [],
      vote_average: episodeData.vote_average || showData.vote_average,
      vote_count: episodeData.vote_count || showData.vote_count,
      tmdb_id: showData.id,
      trailer_url: this.getTrailerUrl(showData.videos),
    };
  }

  extractTitleFromFilename(filename: string): string {
    // Remove file extension
    let title = filename.replace(/\.[^/.]+$/, "");

    // Remove common patterns
    title = title.replace(/\.(19|20)\d{2}\./, " "); // Remove year patterns like .2014.
    title = title.replace(/\.(1080p|720p|480p)\./, " "); // Remove quality
    title = title.replace(/\.(BluRay|WEB-DL|HDRip|DVDRip)\./, " "); // Remove source
    title = title.replace(/\.(H264|x264|x265|AAC|AC3)\./, " "); // Remove codecs
    title = title.replace(/\./g, " "); // Replace dots with spaces
    title = title.replace(/_/g, " "); // Replace underscores with spaces
    title = title.replace(/\s+/g, " "); // Remove multiple spaces
    title = title.trim();

    return title;
  }
}

export const tmdbService = TMDbService.getInstance();
