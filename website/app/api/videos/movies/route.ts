import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/server/mongodb";
import { ObjectId } from "mongodb";
import { revalidateTag } from "next/cache";

function transformVideoRecord(doc: any) {
  return {
    id: doc._id.toString(),
    filename: doc.filename,
    title: doc.title,
    description: doc.description,
    score: doc.score,
    release_date: doc.release_date,
    tagline: doc.tagline,
    runtime: doc.runtime,
    genres: doc.genres,
    cast: doc.cast,
    actors: doc.actors,
    keywords: doc.keywords,
    poster_path: doc.poster_path,
    backdrop_path: doc.backdrop_path,
    production_companies: doc.production_companies,
    production_countries: doc.production_countries,
    spoken_languages: doc.spoken_languages,
    status: doc.status,
    vote_average: doc.vote_average,
    vote_count: doc.vote_count,
    tmdb_id: doc.tmdb_id,
    imdb_id: doc.imdb_id,
    trailer_url: doc.trailer_url,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

async function getAvailableMovieFiles() {
  const filesUrl = process.env.NEXT_PUBLIC_FILES_URL || "http://localhost:3001";
  try {
    const response = await fetch(`${filesUrl}/api/files/videos/movies`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error("Error fetching movie files:", error);
    return [];
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const yearFilter = searchParams.get("year");
    const actorFilter = searchParams.get("actor");
    const genreFilter = searchParams.get("genre");
    const runtimeMin = searchParams.get("runtimeMin") ? parseInt(searchParams.get("runtimeMin")!) : null;
    const runtimeMax = searchParams.get("runtimeMax") ? parseInt(searchParams.get("runtimeMax")!) : null;
    const ratingMin = searchParams.get("ratingMin") ? parseFloat(searchParams.get("ratingMin")!) : null;
    const ratingMax = searchParams.get("ratingMax") ? parseFloat(searchParams.get("ratingMax")!) : null;
    const searchQuery = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "release_date";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const [availableFiles, collection] = await Promise.all([getAvailableMovieFiles(), getCollection("movie_videos")]);

    const videoRecords = await collection.find({}).toArray();
    const videoRecordsMap = new Map(videoRecords.map((record) => [record.filename, record]));

    let allMovies = availableFiles.map((filename: string) => {
      const existingRecord = videoRecordsMap.get(filename);
      if (existingRecord) {
        return transformVideoRecord(existingRecord);
      } else {
        return {
          id: `temp_${filename}`,
          filename,
          title: undefined,
          description: undefined,
          score: undefined,
          release_date: undefined,
        };
      }
    });

    // Apply filters
    if (yearFilter) {
      allMovies = allMovies.filter((movie: any) => {
        if (!movie.release_date) return false;
        const movieYear = new Date(movie.release_date).getFullYear().toString();
        return movieYear === yearFilter;
      });
    }

    if (actorFilter) {
      const selectedActors = actorFilter.split(",").map((actor) => actor.trim());
      allMovies = allMovies.filter((movie: any) => {
        return movie.actors && selectedActors.some((selectedActor) => movie.actors.some((actor: string) => actor.toLowerCase().includes(selectedActor.toLowerCase())));
      });
    }

    if (genreFilter) {
      const selectedGenres = genreFilter.split(",").map((genre) => genre.trim());
      allMovies = allMovies.filter((movie: any) => {
        return movie.genres && selectedGenres.some((selectedGenre) => movie.genres.some((genre: string) => genre.toLowerCase().includes(selectedGenre.toLowerCase())));
      });
    }

    if (runtimeMin !== null || runtimeMax !== null) {
      allMovies = allMovies.filter((movie: any) => {
        if (!movie.runtime) return false;
        const runtime = movie.runtime;
        if (runtimeMin !== null && runtime < runtimeMin) return false;
        if (runtimeMax !== null && runtime > runtimeMax) return false;
        return true;
      });
    }

    if (ratingMin !== null || ratingMax !== null) {
      allMovies = allMovies.filter((movie: any) => {
        if (movie.score === undefined) return false;
        const rating = movie.score;
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
      allMovies = allMovies.filter((movie: any) => {
        const searchableText = [movie.title || "", movie.description || "", movie.filename || "", ...(movie.actors || []), ...(movie.genres || []), ...(movie.keywords || []), movie.tagline || ""].join(" ").toLowerCase();

        return searchTerms.every((term) => searchableText.includes(term));
      });
    }

    allMovies.sort((a: any, b: any) => {
      let aValue, bValue;

      if (sortBy === "rank") {
        aValue = a.score || 0;
        bValue = b.score || 0;
      } else {
        aValue = a.release_date ? new Date(a.release_date).getTime() : 0;
        bValue = b.release_date ? new Date(b.release_date).getTime() : 0;
      }

      if (sortOrder === "asc") {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedMovies = allMovies.slice(startIndex, endIndex);

    // Get unique values for filter dropdowns
    const allActors = new Set<string>();
    const allGenres = new Set<string>();
    const allYears = new Set<string>();

    videoRecords.forEach((record) => {
      if (record.actors) {
        record.actors.forEach((actor: string) => allActors.add(actor));
      }
      if (record.genres) {
        record.genres.forEach((genre: string) => allGenres.add(genre));
      }
      if (record.release_date) {
        const year = new Date(record.release_date).getFullYear().toString();
        allYears.add(year);
      }
    });

    return NextResponse.json({
      movies: paginatedMovies,
      totalMovies: allMovies.length,
      currentPage: page,
      totalPages: Math.ceil(allMovies.length / limit),
      filterOptions: {
        actors: Array.from(allActors).sort(),
        genres: Array.from(allGenres).sort(),
        years: Array.from(allYears).sort().reverse(), // Most recent years first
      },
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const videoData = await req.json();

    if (!videoData.filename || !videoData.title || !videoData.description || videoData.score === undefined || !videoData.release_date) {
      return NextResponse.json({ error: "All required fields (filename, title, description, score, release_date) are required" }, { status: 400 });
    }

    const collection = await getCollection("movie_videos");

    const existingRecord = await collection.findOne({ filename: videoData.filename });
    if (existingRecord) {
      return NextResponse.json({ error: "Video record already exists" }, { status: 409 });
    }

    const newRecord = {
      filename: videoData.filename,
      title: videoData.title,
      description: videoData.description,
      score: Number(videoData.score),
      release_date: videoData.release_date,
      tagline: videoData.tagline || null,
      runtime: videoData.runtime ? Number(videoData.runtime) : null,
      genres: videoData.genres || [],
      cast: videoData.cast || [],
      actors: videoData.actors || [],
      keywords: videoData.keywords || [],
      poster_path: videoData.poster_path || null,
      backdrop_path: videoData.backdrop_path || null,
      production_companies: videoData.production_companies || [],
      production_countries: videoData.production_countries || [],
      spoken_languages: videoData.spoken_languages || [],
      status: videoData.status || null,
      vote_average: videoData.vote_average ? Number(videoData.vote_average) : null,
      vote_count: videoData.vote_count ? Number(videoData.vote_count) : null,
      tmdb_id: videoData.tmdb_id ? Number(videoData.tmdb_id) : null,
      imdb_id: videoData.imdb_id || null,
      trailer_url: videoData.trailer_url || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newRecord);
    const createdRecord = transformVideoRecord({ _id: result.insertedId, ...newRecord });

    revalidateTag("movies");
    return NextResponse.json(createdRecord, { status: 201 });
  } catch (error) {
    console.error("Error creating video record:", error);
    return NextResponse.json({ error: "Failed to create video record" }, { status: 500 });
  }
}
