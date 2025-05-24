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
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

async function getAvailableVideoFiles() {
  const filesUrl = process.env.NEXT_PUBLIC_FILES_URL || "http://localhost:3001";
  try {
    const response = await fetch(`${filesUrl}/api/files/videos`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error("Error fetching video files:", error);
    return [];
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const yearFilter = searchParams.get("year");
    const sortBy = searchParams.get("sortBy") || "release_date";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const [availableFiles, collection] = await Promise.all([getAvailableVideoFiles(), getCollection("videos")]);

    const videoRecords = await collection.find({}).toArray();
    const videoRecordsMap = new Map(videoRecords.map((record) => [record.filename, record]));

    let allVideos = availableFiles.map((filename: string) => {
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

    if (yearFilter) {
      allVideos = allVideos.filter((video: any) => {
        if (!video.release_date) return false;
        const videoYear = new Date(video.release_date).getFullYear().toString();
        return videoYear === yearFilter;
      });
    }

    allVideos.sort((a: any, b: any) => {
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
    const paginatedVideos = allVideos.slice(startIndex, endIndex);

    return NextResponse.json({
      videos: paginatedVideos,
      totalVideos: allVideos.length,
      currentPage: page,
      totalPages: Math.ceil(allVideos.length / limit),
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
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const collection = await getCollection("videos");

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
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newRecord);
    const createdRecord = transformVideoRecord({ _id: result.insertedId, ...newRecord });

    revalidateTag("videos");
    return NextResponse.json(createdRecord, { status: 201 });
  } catch (error) {
    console.error("Error creating video record:", error);
    return NextResponse.json({ error: "Failed to create video record" }, { status: 500 });
  }
}
