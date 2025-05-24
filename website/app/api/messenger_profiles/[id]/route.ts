import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/server/mongodb";
import { ObjectId } from "mongodb";

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

    // Basic validation for update data
    if (!updateData || (updateData.name === undefined && updateData.systemPrompt === undefined && updateData.files === undefined)) {
      return NextResponse.json({ error: "No valid update data provided" }, { status: 400 });
    }

    const collection = await getCollection("messenger_profiles");

    // Build the update document
    const updateDoc: any = {};
    if (updateData.name !== undefined) updateDoc.name = updateData.name;
    if (updateData.systemPrompt !== undefined) updateDoc.systemPrompt = updateData.systemPrompt;
    if (updateData.files !== undefined) updateDoc.files = updateData.files;

    const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateDoc });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Fetch and return the updated profile with transformed ID
    const updatedProfile = await collection.findOne({ _id: new ObjectId(id) });

    if (!updatedProfile) {
      return NextResponse.json({ error: "Profile not found after update" }, { status: 404 });
    }

    return NextResponse.json(transformProfile(updatedProfile), { status: 200 });
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

    return NextResponse.json({ success: true, message: "Profile deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting messenger profile:", error);
    return NextResponse.json({ error: "Failed to delete profile" }, { status: 500 });
  }
}
