import { NextRequest, NextResponse } from "next/server";
import { getEventsCollection } from "@/app/api/mongodb";

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
