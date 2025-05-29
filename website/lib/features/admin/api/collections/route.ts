import { NextResponse } from "next/server";
import { getCollectionNames } from "@/lib/server/mongodb";

export async function GET() {
  try {
    const collections = await getCollectionNames();
    return NextResponse.json({ collections });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}
