import { NextRequest, NextResponse } from "next/server";
import { getEventsCollection } from "@/app/api/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  const collection = await getEventsCollection();
  const events = await collection.find({}).toArray();
  const result = events.map((e: any) => ({
    id: e._id.toString(),
    name: e.name,
    date: e.date,
  }));
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const { name, date } = await req.json();
  if (!name || !date) {
    return NextResponse.json({ error: "Missing name or date" }, { status: 400 });
  }
  const collection = await getEventsCollection();
  const res = await collection.insertOne({ name, date });
  return NextResponse.json({ id: res.insertedId.toString(), name, date }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const url = req.nextUrl;
  const id = url.searchParams.get("id"); // Assuming ID is passed as a query parameter, e.g., ?id=someId
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }
  const collection = await getEventsCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) }); // Import ObjectId from mongodb
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true }, { status: 200 });
}

export async function PUT(req: NextRequest) {
  const url = req.nextUrl;
  const id = url.searchParams.get("id");
  const { name, date } = await req.json();
  if (!id || !name || !date) {
    return NextResponse.json({ error: "ID, name, and date are required" }, { status: 400 });
  }
  const collection = await getEventsCollection();
  const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: { name, date } });
  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true }, { status: 200 });
}
