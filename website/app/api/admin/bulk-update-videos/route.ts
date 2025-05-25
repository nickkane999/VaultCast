import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/server/mongodb";
import { tmdbService } from "@/lib/services/tmdbService";

interface BulkUpdateOptions {
  updateTrailers: boolean;
  updateMissingInfo: boolean;
  overwriteExisting: boolean;
  batchSize: number;
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
        const collection = await getCollection("videos");
        const videos = await collection.find({}).toArray();

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

            // Search for movie on TMDb
            const searchTerm = video.title || tmdbService.extractTitleFromFilename(video.filename);
            const searchResults = await tmdbService.searchMovies(searchTerm);

            if (searchResults.length === 0) {
              progress.failed.push(`${video.title || video.filename} (not found on TMDb)`);
              continue;
            }

            // Get the first result (most likely match)
            const tmdbMovie = searchResults[0];
            const movieDetails = await tmdbService.getMovieDetails(tmdbMovie.id);
            const updateData = tmdbService.transformToVideoFormData(movieDetails);

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
            }

            // Only update if there are fields to update
            if (Object.keys(updateFields).length > 1) {
              // > 1 because updatedAt is always included
              await collection.updateOne({ _id: video._id }, { $set: updateFields });
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
