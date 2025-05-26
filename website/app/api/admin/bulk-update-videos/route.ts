import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/server/mongodb";
import { tmdbService } from "@/lib/services/tmdbService";
import fs from "fs";
import path from "path";

// Helper functions for extracting episode information from filenames
function extractEpisodeInfo(filename: string): { season: number | null; episode: number | null } {
  // Common patterns: S01E01, s01e01, Season 1 Episode 1, 1x01, etc.
  const patterns = [
    /[Ss](\d+)[Ee](\d+)/, // S01E01, s01e01
    /Season\s*(\d+).*Episode\s*(\d+)/i, // Season 1 Episode 1
    /(\d+)x(\d+)/, // 1x01
    /\.(\d+)\.(\d+)\./, // .1.01.
    /season-(\d+)-[eE](\d+)/i, // season-1-e6, season-2-E5 (Dave format)
    /[Ss]eason\s*(\d+).*[eE](\d+)/i, // Season 1 E6, season 2 e5
  ];

  for (const pattern of patterns) {
    const match = filename.match(pattern);
    if (match) {
      return {
        season: parseInt(match[1], 10),
        episode: parseInt(match[2], 10),
      };
    }
  }

  return { season: null, episode: null };
}

function extractShowName(filename: string): string {
  // Remove file extension
  let showName = filename.replace(/\.[^/.]+$/, "");

  // Remove season/episode patterns
  showName = showName.replace(/[Ss]\d+[Ee]\d+.*$/, "");
  showName = showName.replace(/Season\s*\d+.*$/i, "");
  showName = showName.replace(/\d+x\d+.*$/, "");

  // Remove quality indicators
  showName = showName.replace(/\.(1080p|720p|480p|4K|UHD).*$/i, "");
  showName = showName.replace(/\.(BluRay|WEB-DL|HDRip|DVDRip|WEBRip).*$/i, "");

  // Clean up
  showName = showName.replace(/[._]/g, " ");
  showName = showName.replace(/\s+/g, " ");
  showName = showName.trim();

  return showName;
}

// Function to scan file system for TV show files
function scanTVShowFiles(showName?: string, seasonNumber?: number): Array<{ filename: string; relativePath: string; fullPath: string; showName: string; season: number; episode: number }> {
  const tvShowsPath = path.join(process.cwd(), "..", "content-server", "media", "videos", "tv");
  const files: Array<{ filename: string; relativePath: string; fullPath: string; showName: string; season: number; episode: number }> = [];

  if (!fs.existsSync(tvShowsPath)) {
    return files;
  }

  const showDirectories = fs
    .readdirSync(tvShowsPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const currentShowName of showDirectories) {
    // Skip if specific show selected and this isn't it
    if (showName && currentShowName !== showName) {
      continue;
    }

    const showPath = path.join(tvShowsPath, currentShowName);

    // Function to process files in a directory
    const processDirectory = (dirPath: string) => {
      const items = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const item of items) {
        const itemPath = path.join(dirPath, item.name);

        if (item.isDirectory()) {
          // Recursively process subdirectories
          processDirectory(itemPath);
        } else if (item.isFile()) {
          // Check if it's a video file
          const videoExtensions = [".mp4", ".mkv", ".avi", ".mov", ".wmv", ".flv", ".webm", ".m4v"];
          const ext = path.extname(item.name).toLowerCase();

          if (videoExtensions.includes(ext)) {
            const episodeInfo = extractEpisodeInfo(item.name);
            if (episodeInfo.season && episodeInfo.episode) {
              // Skip if specific season selected and this isn't it
              if (seasonNumber && episodeInfo.season !== seasonNumber) {
                continue;
              }

              // Calculate relative path from tv directory
              const relativePath = path.relative(tvShowsPath, itemPath);

              files.push({
                filename: item.name,
                relativePath: relativePath,
                fullPath: itemPath,
                showName: currentShowName,
                season: episodeInfo.season,
                episode: episodeInfo.episode,
              });
            }
          }
        }
      }
    };

    processDirectory(showPath);
  }

  return files;
}

interface BulkUpdateOptions {
  updateTrailers: boolean;
  updateMissingInfo: boolean;
  overwriteExisting: boolean;
  batchSize: number;
  contentType: "movies" | "tv";
  selectedShow?: string;
  selectedSeason?: number;
}

interface BulkUpdateProgress {
  total: number;
  current: number;
  currentMovie: string;
  completed: string[];
  failed: string[];
  skipped: string[];
}

export async function POST(req: NextRequest) {
  const options: BulkUpdateOptions = await req.json();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendError = (error: string) => {
        const message = JSON.stringify({ type: "error", message: error }) + "\n";
        controller.enqueue(encoder.encode(message));
      };

      try {
        let collection;
        let videos;

        if (options.contentType === "tv") {
          collection = await getCollection("tv_videos");

          // For TV shows, scan the file system instead of just the database
          const tvFiles = scanTVShowFiles(options.selectedShow, options.selectedSeason);

          // Convert file system data to video-like objects for processing
          videos = tvFiles.map((file) => ({
            filename: file.relativePath, // Use relative path as filename
            originalFilename: file.filename, // Keep original filename for processing
            fullPath: file.fullPath,
            show_name: file.showName,
            season_number: file.season,
            episode_number: file.episode,
            title: "", // Will be filled from TMDb
            description: "",
            score: 0, // Will be filled from TMDb
            trailer_url: "",
            genres: [],
            actors: [],
            cast: [],
            keywords: [],
            tagline: "",
            runtime: 0,
            poster_path: "",
            backdrop_path: "",
            production_companies: [],
            production_countries: [],
            spoken_languages: [],
            vote_average: 0,
            vote_count: 0,
            tmdb_id: 0,
            imdb_id: "",
            air_date: "",
            isNewFile: true, // Flag to indicate this is a new file from filesystem
          }));
        } else {
          collection = await getCollection("videos");
          videos = await collection.find({}).toArray();
        }

        const progress: BulkUpdateProgress = {
          total: videos.length,
          current: 0,
          currentMovie: "",
          completed: [],
          failed: [],
          skipped: [],
        };

        const sendProgress = (data: any) => {
          const message = JSON.stringify({ type: "progress", data }) + "\n";
          controller.enqueue(encoder.encode(message));
        };

        const sendComplete = (stats: { updated: number; skipped: number; failed: number }) => {
          const message = JSON.stringify({ type: "complete", data: stats }) + "\n";
          controller.enqueue(encoder.encode(message));
        };

        let updated = 0;
        let batchCount = 0;

        for (const video of videos) {
          progress.current++;
          progress.currentMovie = video.title || video.filename;
          sendProgress(progress);

          try {
            // Skip if no title and can't extract from filename
            if (!video.title && !video.filename) {
              progress.skipped.push(video.filename || "Unknown");
              continue;
            }

            // Check if update is needed
            const needsUpdate = (options.updateTrailers && (!video.trailer_url || options.overwriteExisting)) || (options.updateMissingInfo && (!video.genres?.length || !video.actors?.length || !video.cast?.length || !video.keywords?.length || options.overwriteExisting));

            if (!needsUpdate) {
              progress.skipped.push(video.title || video.filename);
              continue;
            }

            let updateData;

            if (options.contentType === "tv") {
              // For TV shows, use episode info from filesystem scan or extract from filename
              let episodeInfo;
              if ((video as any).isNewFile) {
                // Use the already extracted info from filesystem scan
                episodeInfo = {
                  season: video.season_number,
                  episode: video.episode_number,
                };
              } else {
                // Extract from filename for existing database entries
                episodeInfo = extractEpisodeInfo((video as any).originalFilename || video.filename);
              }

              if (!episodeInfo.season || !episodeInfo.episode) {
                progress.failed.push(`${video.title || video.filename} (could not extract episode info)`);
                continue;
              }

              // Search for TV show
              const showName = video.show_name || extractShowName((video as any).originalFilename || video.filename);
              const searchResults = await tmdbService.searchTVShows(showName);

              if (searchResults.length === 0) {
                progress.failed.push(`${video.title || video.filename} (show not found on TMDb)`);
                continue;
              }

              // Get show details and episode details
              const tmdbShow = searchResults[0];
              try {
                const showDetails = await tmdbService.getTVShowDetails(tmdbShow.id);
                const episodeDetails = await tmdbService.getTVEpisodeDetails(tmdbShow.id, episodeInfo.season, episodeInfo.episode);
                updateData = tmdbService.transformTVEpisodeToFormData(episodeDetails, showDetails);

                // Add episode-specific fields
                updateData.season_number = episodeInfo.season;
                updateData.episode_number = episodeInfo.episode;
                updateData.show_name = showDetails.name;
              } catch (episodeError) {
                // Fall back to show data if episode not found
                const showDetails = await tmdbService.getTVShowDetails(tmdbShow.id);
                updateData = tmdbService.transformTVShowToFormData(showDetails);
                updateData.season_number = episodeInfo.season;
                updateData.episode_number = episodeInfo.episode;
                updateData.show_name = showDetails.name;
              }
            } else {
              // For movies, use existing logic
              const searchTerm = video.title || tmdbService.extractTitleFromFilename(video.filename);
              const searchResults = await tmdbService.searchMovies(searchTerm);

              if (searchResults.length === 0) {
                progress.failed.push(`${video.title || video.filename} (not found on TMDb)`);
                continue;
              }

              // Get the first result (most likely match)
              const tmdbMovie = searchResults[0];
              const movieDetails = await tmdbService.getMovieDetails(tmdbMovie.id);
              updateData = tmdbService.transformToVideoFormData(movieDetails);
            }

            // Prepare update object
            const updateFields: any = {
              updatedAt: new Date(),
            };

            // Update trailers if requested
            if (options.updateTrailers && updateData.trailer_url) {
              if (!video.trailer_url || options.overwriteExisting) {
                updateFields.trailer_url = updateData.trailer_url;
              }
            }

            // Update missing info if requested
            if (options.updateMissingInfo) {
              if (!video.genres?.length || options.overwriteExisting) {
                updateFields.genres = updateData.genres || [];
              }
              if (!video.actors?.length || options.overwriteExisting) {
                updateFields.actors = updateData.actors || [];
              }
              if (!video.cast?.length || options.overwriteExisting) {
                updateFields.cast = updateData.cast || [];
              }
              if (!video.keywords?.length || options.overwriteExisting) {
                updateFields.keywords = updateData.keywords || [];
              }
              if (!video.tagline || options.overwriteExisting) {
                updateFields.tagline = updateData.tagline;
              }
              if (!video.runtime || options.overwriteExisting) {
                updateFields.runtime = updateData.runtime;
              }
              if (!video.poster_path || options.overwriteExisting) {
                updateFields.poster_path = updateData.poster_path;
              }
              if (!video.backdrop_path || options.overwriteExisting) {
                updateFields.backdrop_path = updateData.backdrop_path;
              }
              if (!video.production_companies?.length || options.overwriteExisting) {
                updateFields.production_companies = updateData.production_companies || [];
              }
              if (!video.production_countries?.length || options.overwriteExisting) {
                updateFields.production_countries = updateData.production_countries || [];
              }
              if (!video.spoken_languages?.length || options.overwriteExisting) {
                updateFields.spoken_languages = updateData.spoken_languages || [];
              }
              if (!video.vote_average || options.overwriteExisting) {
                updateFields.vote_average = updateData.vote_average;
              }
              if (!video.vote_count || options.overwriteExisting) {
                updateFields.vote_count = updateData.vote_count;
              }
              if (!video.tmdb_id || options.overwriteExisting) {
                updateFields.tmdb_id = updateData.tmdb_id;
              }
              if (!video.imdb_id || options.overwriteExisting) {
                updateFields.imdb_id = updateData.imdb_id;
              }

              // TV show specific fields
              if (options.contentType === "tv") {
                if (!video.title || options.overwriteExisting) {
                  updateFields.title = updateData.title;
                }
                if (!video.description || options.overwriteExisting) {
                  updateFields.description = updateData.description;
                }
                if (!video.air_date || options.overwriteExisting) {
                  updateFields.air_date = updateData.air_date;
                }
                if (!video.show_name || options.overwriteExisting) {
                  updateFields.show_name = updateData.show_name;
                }
                if (!video.season_number || options.overwriteExisting) {
                  updateFields.season_number = updateData.season_number;
                }
                if (!video.episode_number || options.overwriteExisting) {
                  updateFields.episode_number = updateData.episode_number;
                }
              }
            }

            // Only update if there are fields to update
            if (Object.keys(updateFields).length > 1) {
              // > 1 because updatedAt is always included
              if ((video as any).isNewFile) {
                // For new files from filesystem, create new database entry
                const newEpisode = {
                  filename: video.filename,
                  title: updateData.title || "",
                  description: updateData.description || "",
                  score: Math.round(updateData.vote_average || 0),
                  air_date: updateData.air_date || "",
                  season_number: video.season_number,
                  episode_number: video.episode_number,
                  show_name: video.show_name,
                  runtime: updateData.runtime || 0,
                  genres: updateData.genres || [],
                  cast: updateData.cast || [],
                  actors: updateData.actors || [],
                  keywords: updateData.keywords || [],
                  poster_path: updateData.poster_path || "",
                  backdrop_path: updateData.backdrop_path || "",
                  vote_average: updateData.vote_average || 0,
                  vote_count: updateData.vote_count || 0,
                  tmdb_id: updateData.tmdb_id || 0,
                  imdb_id: updateData.imdb_id || "",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                };
                await collection.insertOne(newEpisode);
              } else {
                // For existing database entries, update them
                await collection.updateOne({ _id: (video as any)._id }, { $set: updateFields });
              }
              updated++;
              progress.completed.push(video.title || video.filename);
            } else {
              progress.skipped.push(video.title || video.filename);
            }

            // Rate limiting: pause between batches
            batchCount++;
            if (batchCount >= options.batchSize) {
              await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second pause
              batchCount = 0;
            }
          } catch (error) {
            console.error(`Error updating ${video.title || video.filename}:`, error);
            progress.failed.push(`${video.title || video.filename} (${error instanceof Error ? error.message : "Unknown error"})`);
          }
        }

        sendComplete({
          updated,
          skipped: progress.skipped.length,
          failed: progress.failed.length,
        });
      } catch (error) {
        console.error("Bulk update error:", error);
        sendError(error instanceof Error ? error.message : "Unknown error occurred");
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
