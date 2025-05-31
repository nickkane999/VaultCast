import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/server/mongodb";
import { MarketingQuery } from "@/lib/features/marketing_links/types";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const queryData = await request.json();
    const { query, product, targetAudience, platform, budget, experience } = queryData;

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const collection = await getCollection("marketing_queries");

    const savedQuery: MarketingQuery = {
      id: uuidv4(),
      query,
      product,
      targetAudience,
      platform,
      budget,
      experience,
      createdAt: new Date().toISOString(),
    };

    await collection.insertOne(savedQuery);

    return NextResponse.json(savedQuery);
  } catch (error) {
    console.error("Save query error:", error);
    return NextResponse.json({ error: "Failed to save query" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const collection = await getCollection("marketing_queries");

    const queries = await collection.find({}).sort({ createdAt: -1 }).limit(50).toArray();

    return NextResponse.json(queries);
  } catch (error) {
    console.error("Load queries error:", error);
    return NextResponse.json({ error: "Failed to load queries" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryId = searchParams.get("id");

    if (!queryId) {
      return NextResponse.json({ error: "Query ID is required" }, { status: 400 });
    }

    const collection = await getCollection("marketing_queries");

    const result = await collection.deleteOne({ id: queryId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Query not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete query error:", error);
    return NextResponse.json({ error: "Failed to delete query" }, { status: 500 });
  }
}
