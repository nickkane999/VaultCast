import { NextRequest, NextResponse } from "next/server";
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

    const shows: Array<{
      name: string;
      seasons: Array<{
        seasonNumber: number;
        episodeCount: number;
      }>;
    }> = [];

    // Read all show directories
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

      // Process the show directory
      processDirectory(showPath);

      // Convert to seasons array
      if (seasonsMap.size > 0) {
        const seasons = Array.from(seasonsMap.entries())
          .map(([seasonNumber, episodeCount]) => ({ seasonNumber, episodeCount }))
          .sort((a, b) => a.seasonNumber - b.seasonNumber);

        shows.push({
          name: showName,
          seasons,
        });
      }
    }

    // Sort shows alphabetically
    shows.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ shows });
  } catch (error) {
    console.error("Error scanning TV shows:", error);
    return NextResponse.json({ error: "Failed to scan TV shows directory" }, { status: 500 });
  }
}
