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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid episode ID format" }, { status: 400 });
    }

    const collection = await getCollection("tv_videos");
    const episodeRecord = await collection.findOne({ _id: new ObjectId(id) });

    if (!episodeRecord) {
      return NextResponse.json({ error: "TV episode record not found" }, { status: 404 });
    }

    return NextResponse.json(transformTVEpisodeRecord(episodeRecord));
  } catch (error) {
    console.error("Error fetching TV episode record:", error);
    return NextResponse.json({ error: "Failed to fetch TV episode record" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const updateData = await req.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid episode ID format" }, { status: 400 });
    }

    if (!updateData.title || !updateData.description || updateData.score === undefined || !updateData.air_date || !updateData.show_name) {
      return NextResponse.json({ error: "All required fields (title, description, score, air_date, show_name) are required" }, { status: 400 });
    }

    const collection = await getCollection("tv_videos");
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          filename: updateData.filename, // Preserve the filename
          title: updateData.title,
          description: updateData.description,
          score: Number(updateData.score),
          air_date: updateData.air_date,
          season_number: updateData.season_number || 1,
          episode_number: updateData.episode_number || 1,
          show_name: updateData.show_name,
          runtime: updateData.runtime ? Number(updateData.runtime) : null,
          genres: updateData.genres || [],
          cast: updateData.cast || [],
          actors: updateData.actors || [],
          keywords: updateData.keywords || [],
          poster_path: updateData.poster_path || null,
          backdrop_path: updateData.backdrop_path || null,
          vote_average: updateData.vote_average ? Number(updateData.vote_average) : null,
          vote_count: updateData.vote_count ? Number(updateData.vote_count) : null,
          tmdb_id: updateData.tmdb_id ? Number(updateData.tmdb_id) : null,
          imdb_id: updateData.imdb_id || null,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "TV episode record not found" }, { status: 404 });
    }

    const updatedRecord = await collection.findOne({ _id: new ObjectId(id) });

    revalidateTag("tv");
    return NextResponse.json(transformTVEpisodeRecord(updatedRecord));
  } catch (error) {
    console.error("Error updating TV episode record:", error);
    return NextResponse.json({ error: "Failed to update TV episode record" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid episode ID format" }, { status: 400 });
    }

    const collection = await getCollection("tv_videos");
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "TV episode record not found" }, { status: 404 });
    }

    revalidateTag("tv");
    return NextResponse.json({ message: "TV episode record deleted successfully", id });
  } catch (error) {
    console.error("Error deleting TV episode record:", error);
    return NextResponse.json({ error: "Failed to delete TV episode record" }, { status: 500 });
  }
}
