import { NextRequest, NextResponse } from "next/server";
import { getCollectionNames } from "@/lib/server/mongodb";

export async function GET(req: NextRequest) {
  try {
    const collections = await getCollectionNames();
    return NextResponse.json({ collections });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}
