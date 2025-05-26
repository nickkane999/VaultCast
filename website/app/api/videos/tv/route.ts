import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/server/mongodb";
import { ObjectId } from "mongodb";
import { revalidateTag } from "next/cache";

function transformTVEpisodeRecord(doc: any) {
  return {
    id: doc._id.toString(),
    filename: doc.filename,
    title: doc.title,
    description: doc.description,
    score: doc.score,
    air_date: doc.air_date,
    season_number: doc.season_number,
    episode_number: doc.episode_number,
    show_name: doc.show_name,
    runtime: doc.runtime,
    genres: doc.genres,
    cast: doc.cast,
    actors: doc.actors,
    keywords: doc.keywords,
    poster_path: doc.poster_path,
    backdrop_path: doc.backdrop_path,
    vote_average: doc.vote_average,
    vote_count: doc.vote_count,
    tmdb_id: doc.tmdb_id,
    imdb_id: doc.imdb_id,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

async function getAvailableTVFiles() {
  const filesUrl = process.env.NEXT_PUBLIC_FILES_URL || "http://localhost:3001";
  try {
    const response = await fetch(`${filesUrl}/api/files/videos/tv`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error("Error fetching TV files:", error);
    return [];
  }
}

function parseShowSeasonFromPath(filename: string) {
  // Extract show name and season from path like "Dave/Season 2/episode.mp4"
  const pathParts = filename.split("/");
  if (pathParts.length >= 3) {
    const showName = pathParts[0];
    const seasonPart = pathParts[1];
    const seasonMatch = seasonPart.match(/Season (\d+)/i);
    const seasonNumber = seasonMatch ? parseInt(seasonMatch[1]) : 1;

    // Try to extract episode number from filename
    const episodeFilename = pathParts[pathParts.length - 1];
    const episodeMatch = episodeFilename.match(/episode[- ]?(\d+)/i) || episodeFilename.match(/s\d+e(\d+)/i) || episodeFilename.match(/(\d+)/);
    const episodeNumber = episodeMatch ? parseInt(episodeMatch[1]) : 1;

    return { showName, seasonNumber, episodeNumber };
  }

  return { showName: "Unknown Show", seasonNumber: 1, episodeNumber: 1 };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const showFilter = searchParams.get("show");
    const seasonFilter = searchParams.get("season") ? parseInt(searchParams.get("season")!) : null;
    const yearFilter = searchParams.get("year");
    const actorFilter = searchParams.get("actor");
    const genreFilter = searchParams.get("genre");
    const runtimeMin = searchParams.get("runtimeMin") ? parseInt(searchParams.get("runtimeMin")!) : null;
    const runtimeMax = searchParams.get("runtimeMax") ? parseInt(searchParams.get("runtimeMax")!) : null;
    const ratingMin = searchParams.get("ratingMin") ? parseFloat(searchParams.get("ratingMin")!) : null;
    const ratingMax = searchParams.get("ratingMax") ? parseFloat(searchParams.get("ratingMax")!) : null;
    const searchQuery = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "air_date";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const [availableFiles, collection] = await Promise.all([getAvailableTVFiles(), getCollection("tv_videos")]);

    const episodeRecords = await collection.find({}).toArray();
    const episodeRecordsMap = new Map(episodeRecords.map((record) => [record.filename, record]));

    let allEpisodes = availableFiles.map((filename: string) => {
      const existingRecord = episodeRecordsMap.get(filename);
      if (existingRecord) {
        return transformTVEpisodeRecord(existingRecord);
      } else {
        const { showName, seasonNumber, episodeNumber } = parseShowSeasonFromPath(filename);
        return {
          id: `temp_${filename}`,
          filename,
          title: undefined,
          description: undefined,
          score: undefined,
          air_date: undefined,
          season_number: seasonNumber,
          episode_number: episodeNumber,
          show_name: showName,
        };
      }
    });

    // Apply filters
    if (showFilter) {
      allEpisodes = allEpisodes.filter((episode: any) => {
        return episode.show_name && episode.show_name.toLowerCase().includes(showFilter.toLowerCase());
      });
    }

    if (seasonFilter !== null) {
      allEpisodes = allEpisodes.filter((episode: any) => {
        return episode.season_number === seasonFilter;
      });
    }

    if (yearFilter) {
      allEpisodes = allEpisodes.filter((episode: any) => {
        if (!episode.air_date) return false;
        const episodeYear = new Date(episode.air_date).getFullYear().toString();
        return episodeYear === yearFilter;
      });
    }

    if (actorFilter) {
      const selectedActors = actorFilter.split(",").map((actor) => actor.trim());
      allEpisodes = allEpisodes.filter((episode: any) => {
        return episode.actors && selectedActors.some((selectedActor) => episode.actors.some((actor: string) => actor.toLowerCase().includes(selectedActor.toLowerCase())));
      });
    }

    if (genreFilter) {
      const selectedGenres = genreFilter.split(",").map((genre) => genre.trim());
      allEpisodes = allEpisodes.filter((episode: any) => {
        return episode.genres && selectedGenres.some((selectedGenre) => episode.genres.some((genre: string) => genre.toLowerCase().includes(selectedGenre.toLowerCase())));
      });
    }

    if (runtimeMin !== null || runtimeMax !== null) {
      allEpisodes = allEpisodes.filter((episode: any) => {
        if (!episode.runtime) return false;
        const runtime = episode.runtime;
        if (runtimeMin !== null && runtime < runtimeMin) return false;
        if (runtimeMax !== null && runtime > runtimeMax) return false;
        return true;
      });
    }

    if (ratingMin !== null || ratingMax !== null) {
      allEpisodes = allEpisodes.filter((episode: any) => {
        if (episode.score === undefined) return false;
        const rating = episode.score;
        if (ratingMin !== null && rating < ratingMin) return false;
        if (ratingMax !== null && rating > ratingMax) return false;
        return true;
      });
    }

    if (searchQuery) {
      const searchTerms = searchQuery
        .toLowerCase()
        .split(" ")
        .filter((term) => term.length > 0);
      allEpisodes = allEpisodes.filter((episode: any) => {
        const searchableText = [episode.title || "", episode.description || "", episode.filename || "", episode.show_name || "", ...(episode.actors || []), ...(episode.genres || []), ...(episode.keywords || [])].join(" ").toLowerCase();

        return searchTerms.every((term) => searchableText.includes(term));
      });
    }

    // Sort episodes
    allEpisodes.sort((a: any, b: any) => {
      let aValue, bValue;

      if (sortBy === "rating") {
        aValue = a.score || 0;
        bValue = b.score || 0;
      } else if (sortBy === "episode_number") {
        aValue = a.episode_number || 0;
        bValue = b.episode_number || 0;
      } else {
        aValue = a.air_date ? new Date(a.air_date).getTime() : 0;
        bValue = b.air_date ? new Date(b.air_date).getTime() : 0;
      }

      if (sortOrder === "asc") {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEpisodes = allEpisodes.slice(startIndex, endIndex);

    // Build show hierarchy
    const showsMap = new Map();
    allEpisodes.forEach((episode: any) => {
      const showName = episode.show_name || "Unknown Show";
      if (!showsMap.has(showName)) {
        showsMap.set(showName, { name: showName, seasons: new Map(), totalEpisodes: 0 });
      }

      const show = showsMap.get(showName);
      const seasonNumber = episode.season_number || 1;

      if (!show.seasons.has(seasonNumber)) {
        show.seasons.set(seasonNumber, { seasonNumber, episodes: [], episodeCount: 0 });
      }

      show.seasons.get(seasonNumber).episodes.push(episode);
      show.seasons.get(seasonNumber).episodeCount++;
      show.totalEpisodes++;
    });

    // Convert to array format
    const shows = Array.from(showsMap.values()).map((show) => ({
      ...show,
      seasons: Array.from(show.seasons.values()),
    }));

    // Get unique values for filter dropdowns
    const allShows = new Set<string>();
    const allActors = new Set<string>();
    const allGenres = new Set<string>();
    const allYears = new Set<string>();

    episodeRecords.forEach((record) => {
      if (record.show_name) allShows.add(record.show_name);
      if (record.actors) {
        record.actors.forEach((actor: string) => allActors.add(actor));
      }
      if (record.genres) {
        record.genres.forEach((genre: string) => allGenres.add(genre));
      }
      if (record.air_date) {
        const year = new Date(record.air_date).getFullYear().toString();
        allYears.add(year);
      }
    });

    return NextResponse.json({
      episodes: paginatedEpisodes,
      shows: shows,
      totalEpisodes: allEpisodes.length,
      currentPage: page,
      totalPages: Math.ceil(allEpisodes.length / limit),
      filterOptions: {
        shows: Array.from(allShows).sort(),
        actors: Array.from(allActors).sort(),
        genres: Array.from(allGenres).sort(),
        years: Array.from(allYears).sort().reverse(), // Most recent years first
      },
    });
  } catch (error) {
    console.error("Error fetching TV shows:", error);
    return NextResponse.json({ error: "Failed to fetch TV shows" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const episodeData = await req.json();

    if (!episodeData.filename || !episodeData.title || !episodeData.description || episodeData.score === undefined || !episodeData.air_date || !episodeData.show_name) {
      return NextResponse.json({ error: "All required fields (filename, title, description, score, air_date, show_name) are required" }, { status: 400 });
    }

    const collection = await getCollection("tv_videos");

    const existingRecord = await collection.findOne({ filename: episodeData.filename });
    if (existingRecord) {
      return NextResponse.json({ error: "TV episode record already exists" }, { status: 409 });
    }

    const newRecord = {
      filename: episodeData.filename,
      title: episodeData.title,
      description: episodeData.description,
      score: Number(episodeData.score),
      air_date: episodeData.air_date,
      season_number: episodeData.season_number || 1,
      episode_number: episodeData.episode_number || 1,
      show_name: episodeData.show_name,
      runtime: episodeData.runtime ? Number(episodeData.runtime) : null,
      genres: episodeData.genres || [],
      cast: episodeData.cast || [],
      actors: episodeData.actors || [],
      keywords: episodeData.keywords || [],
      poster_path: episodeData.poster_path || null,
      backdrop_path: episodeData.backdrop_path || null,
      vote_average: episodeData.vote_average ? Number(episodeData.vote_average) : null,
      vote_count: episodeData.vote_count ? Number(episodeData.vote_count) : null,
      tmdb_id: episodeData.tmdb_id ? Number(episodeData.tmdb_id) : null,
      imdb_id: episodeData.imdb_id || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newRecord);
    const createdRecord = transformTVEpisodeRecord({ _id: result.insertedId, ...newRecord });

    revalidateTag("tv");
    return NextResponse.json(createdRecord, { status: 201 });
  } catch (error) {
    console.error("Error creating TV episode record:", error);
    return NextResponse.json({ error: "Failed to create TV episode record" }, { status: 500 });
  }
}
