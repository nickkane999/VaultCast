import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/server/mongodb";
import { ObjectId } from "mongodb";
import { revalidateTag } from "next/cache";

// Helper function to transform MongoDB document to profile format
function transformProfile(doc: any) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    systemPrompt: doc.systemPrompt,
    files: doc.files || [],
  };
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const updateData = await req.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid profile ID format" }, { status: 400 });
    }

    // Basic validation
    if (!updateData.name || !updateData.systemPrompt || !Array.isArray(updateData.files)) {
      return NextResponse.json({ error: "Invalid profile data" }, { status: 400 });
    }

    const collection = await getCollection("messenger_profiles");
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name: updateData.name,
          systemPrompt: updateData.systemPrompt,
          files: updateData.files,
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Return the updated profile
    const updatedProfile = transformProfile({
      _id: new ObjectId(id),
      name: updateData.name,
      systemPrompt: updateData.systemPrompt,
      files: updateData.files,
    });

    revalidateTag("ai-messenger");
    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Error updating messenger profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid profile ID format" }, { status: 400 });
    }

    const collection = await getCollection("messenger_profiles");
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    revalidateTag("ai-messenger");
    return NextResponse.json({ message: "Profile deleted successfully", id });
  } catch (error) {
    console.error("Error deleting messenger profile:", error);
    return NextResponse.json({ error: "Failed to delete profile" }, { status: 500 });
  }
}
