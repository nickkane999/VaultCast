import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/app/api/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const collection = await getCollection("messenger_profiles");
    const profiles = await collection.find({}).toArray();
    return NextResponse.json(profiles);
  } catch (error) {
    console.error("Error fetching messenger profiles:", error);
    return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const profileData = await req.json();

    // Basic validation (you might want more robust validation)
    if (!profileData.name || !profileData.systemPrompt || !Array.isArray(profileData.files)) {
      return NextResponse.json({ error: "Invalid profile data" }, { status: 400 });
    }

    const collection = await getCollection("messenger_profiles");
    const result = await collection.insertOne(profileData);

    return NextResponse.json({ message: "Profile created successfully", id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error("Error creating messenger profile:", error);
    return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Profile ID is required" }, { status: 400 });
    }

    const collection = await getCollection("messenger_profiles");

    // Attempt to delete the profile by ID
    const result = await collection.deleteOne({ _id: new ObjectId(id as string) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Profile deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting messenger profile:", error);
    // Handle invalid ObjectId format specifically if needed
    if (error instanceof Error && error.message.includes("ObjectId")) {
      return NextResponse.json({ error: "Invalid profile ID format" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to delete profile" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const id = url.searchParams.get("id");
    const updateData = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Profile ID is required for update" }, { status: 400 });
    }

    // Basic validation for update data (adjust as needed)
    if (!updateData || (updateData.name === undefined && updateData.systemPrompt === undefined && updateData.files === undefined)) {
      return NextResponse.json({ error: "No valid update data provided" }, { status: 400 });
    }

    // Optional: More specific validation for each field if they are provided
    if (updateData.name !== undefined && typeof updateData.name !== "string") {
      return NextResponse.json({ error: "Invalid name format" }, { status: 400 });
    }
    if (updateData.systemPrompt !== undefined && typeof updateData.systemPrompt !== "string") {
      return NextResponse.json({ error: "Invalid system prompt format" }, { status: 400 });
    }
    if (updateData.files !== undefined && (!Array.isArray(updateData.files) || !updateData.files.every((file: any) => typeof file === "string"))) {
      return NextResponse.json({ error: "Files must be an array of strings" }, { status: 400 });
    }

    const collection = await getCollection("messenger_profiles");

    // Build the update document dynamically based on provided fields
    const updateDoc: any = {};
    if (updateData.name !== undefined) updateDoc.name = updateData.name;
    if (updateData.systemPrompt !== undefined) updateDoc.systemPrompt = updateData.systemPrompt;
    if (updateData.files !== undefined) updateDoc.files = updateData.files;

    const result = await collection.updateOne({ _id: new ObjectId(id as string) }, { $set: updateDoc });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Profile not found or not modified" }, { status: 404 });
    }

    // Fetch and return the updated profile
    const updatedProfile = await collection.findOne({ _id: new ObjectId(id as string) });

    return NextResponse.json(updatedProfile, { status: 200 });
  } catch (error) {
    console.error("Error updating messenger profile:", error);
    // Handle invalid ObjectId format specifically if needed
    if (error instanceof Error && error.message.includes("ObjectId")) {
      return NextResponse.json({ error: "Invalid profile ID format" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
