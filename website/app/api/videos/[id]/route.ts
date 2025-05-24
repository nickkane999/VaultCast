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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid video ID format" }, { status: 400 });
    }

    const collection = await getCollection("videos");
    const videoRecord = await collection.findOne({ _id: new ObjectId(id) });

    if (!videoRecord) {
      return NextResponse.json({ error: "Video record not found" }, { status: 404 });
    }

    return NextResponse.json(transformVideoRecord(videoRecord));
  } catch (error) {
    console.error("Error fetching video record:", error);
    return NextResponse.json({ error: "Failed to fetch video record" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const updateData = await req.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid video ID format" }, { status: 400 });
    }

    if (!updateData.title || !updateData.description || updateData.score === undefined || !updateData.release_date) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const collection = await getCollection("videos");
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title: updateData.title,
          description: updateData.description,
          score: Number(updateData.score),
          release_date: updateData.release_date,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Video record not found" }, { status: 404 });
    }

    const updatedRecord = await collection.findOne({ _id: new ObjectId(id) });

    revalidateTag("videos");
    return NextResponse.json(transformVideoRecord(updatedRecord));
  } catch (error) {
    console.error("Error updating video record:", error);
    return NextResponse.json({ error: "Failed to update video record" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid video ID format" }, { status: 400 });
    }

    const collection = await getCollection("videos");
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Video record not found" }, { status: 404 });
    }

    revalidateTag("videos");
    return NextResponse.json({ message: "Video record deleted successfully", id });
  } catch (error) {
    console.error("Error deleting video record:", error);
    return NextResponse.json({ error: "Failed to delete video record" }, { status: 500 });
  }
}
