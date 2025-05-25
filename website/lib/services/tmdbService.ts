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

  async getMovieDetails(movieId: number): Promise<TMDbMovieData> {
    try {
      console.log("Fetching details for TMDb movie ID:", movieId);

      const [movieResponse, creditsResponse, keywordsResponse] = await Promise.all([
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
      ]);

      console.log("Successfully fetched movie details for:", movieResponse.data.title);

      return {
        ...movieResponse.data,
        credits: creditsResponse.data,
        keywords: keywordsResponse.data,
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
      score: Math.round(tmdbData.vote_average), // Convert 0-10 scale
      tagline: tmdbData.tagline,
      runtime: tmdbData.runtime,
      genres: tmdbData.genres?.map((g) => g.name) || [],
      cast: castData,
      actors: castData.map((actor) => actor.name), // Just the names for filtering
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
