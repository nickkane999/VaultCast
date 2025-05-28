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

export async function GET() {
  try {
    const collection = await getCollection("messenger_profiles");
    const profiles = await collection.find({}).toArray();

    // Transform _id to id for frontend compatibility
    const transformedProfiles = profiles.map(transformProfile);

    return NextResponse.json(transformedProfiles);
  } catch (error) {
    console.error("Error fetching messenger profiles:", error);
    return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const profileData = await req.json();

    if (!profileData.name || !profileData.systemPrompt || !Array.isArray(profileData.files)) {
      return NextResponse.json({ error: "Invalid profile data" }, { status: 400 });
    }

    const collection = await getCollection("messenger_profiles");
    const result = await collection.insertOne({
      name: profileData.name,
      systemPrompt: profileData.systemPrompt,
      files: profileData.files,
    });

    const createdProfile = transformProfile({
      _id: result.insertedId,
      name: profileData.name,
      systemPrompt: profileData.systemPrompt,
      files: profileData.files,
    });

    revalidateTag("ai-messenger");
    return NextResponse.json(createdProfile, { status: 201 });
  } catch (error) {
    console.error("Error creating messenger profile:", error);
    return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
  }
}
