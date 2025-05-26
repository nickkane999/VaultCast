import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/server/mongodb";
import fs from "fs";
import path from "path";

// Helper function to extract episode info from filename
function extractEpisodeInfo(filename: string): { season: number | null; episode: number | null } {
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

export async function GET() {
  try {
    // Path to TV shows directory
    const tvShowsPath = path.join(process.cwd(), "..", "content-server", "media", "videos", "tv");

    if (!fs.existsSync(tvShowsPath)) {
      return NextResponse.json({ error: "TV shows directory not found" }, { status: 404 });
    }

    // Get shows from file system
    const fileSystemShows = new Map<string, Map<number, number>>();

    const showDirectories = fs
      .readdirSync(tvShowsPath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    for (const showName of showDirectories) {
      const showPath = path.join(tvShowsPath, showName);
      const seasonsMap = new Map<number, number>();

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
                const currentCount = seasonsMap.get(episodeInfo.season) || 0;
                seasonsMap.set(episodeInfo.season, currentCount + 1);
              }
            }
          }
        }
      };

      processDirectory(showPath);

      if (seasonsMap.size > 0) {
        fileSystemShows.set(showName, seasonsMap);
      }
    }

    // Get shows from database
    const collection = await getCollection("tv_videos");
    const dbEpisodes = await collection.find({}).toArray();

    const databaseShows = new Map<string, Map<number, number>>();

    for (const episode of dbEpisodes) {
      if (episode.show_name && episode.season_number) {
        if (!databaseShows.has(episode.show_name)) {
          databaseShows.set(episode.show_name, new Map());
        }
        const seasons = databaseShows.get(episode.show_name)!;
        const currentCount = seasons.get(episode.season_number) || 0;
        seasons.set(episode.season_number, currentCount + 1);
      }
    }

    // Compare and categorize shows
    const recordedShows: Array<{
      name: string;
      seasons: Array<{
        seasonNumber: number;
        episodeCount: number;
        recordedCount: number;
        status: "complete" | "partial" | "none";
      }>;
      status: "complete" | "partial" | "none";
    }> = [];

    const unrecordedShows: Array<{
      name: string;
      seasons: Array<{
        seasonNumber: number;
        episodeCount: number;
      }>;
    }> = [];

    for (const [showName, fileSeasons] of fileSystemShows.entries()) {
      const dbSeasons = databaseShows.get(showName);

      if (!dbSeasons) {
        // Show not in database at all
        unrecordedShows.push({
          name: showName,
          seasons: Array.from(fileSeasons.entries())
            .map(([seasonNumber, episodeCount]) => ({ seasonNumber, episodeCount }))
            .sort((a, b) => a.seasonNumber - b.seasonNumber),
        });
      } else {
        // Show exists in database, check completeness
        const seasons = Array.from(fileSeasons.entries())
          .map(([seasonNumber, episodeCount]) => {
            const recordedCount = dbSeasons.get(seasonNumber) || 0;
            let status: "complete" | "partial" | "none";

            if (recordedCount === 0) {
              status = "none";
            } else if (recordedCount >= episodeCount) {
              status = "complete";
            } else {
              status = "partial";
            }

            return {
              seasonNumber,
              episodeCount,
              recordedCount,
              status,
            };
          })
          .sort((a, b) => a.seasonNumber - b.seasonNumber);

        // Determine overall show status
        const hasComplete = seasons.some((s) => s.status === "complete");
        const hasPartial = seasons.some((s) => s.status === "partial");
        const hasNone = seasons.some((s) => s.status === "none");

        let showStatus: "complete" | "partial" | "none";
        if (hasNone || hasPartial) {
          showStatus = "partial";
        } else if (hasComplete) {
          showStatus = "complete";
        } else {
          showStatus = "none";
        }

        recordedShows.push({
          name: showName,
          seasons,
          status: showStatus,
        });
      }
    }

    // Sort shows alphabetically
    recordedShows.sort((a, b) => a.name.localeCompare(b.name));
    unrecordedShows.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      recordedShows,
      unrecordedShows,
      summary: {
        totalShows: fileSystemShows.size,
        recordedShows: recordedShows.length,
        unrecordedShows: unrecordedShows.length,
        completeShows: recordedShows.filter((s) => s.status === "complete").length,
        partialShows: recordedShows.filter((s) => s.status === "partial").length,
      },
    });
  } catch (error) {
    console.error("Error analyzing TV show status:", error);
    return NextResponse.json({ error: "Failed to analyze TV show status" }, { status: 500 });
  }
}
