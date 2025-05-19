import { NextRequest, NextResponse } from "next/server";
import { getEventsCollection } from "@/app/api/mongodb";
import { ObjectId } from "mongodb";

function isValidRequest(body: any, id?: string | null) {
  const { name, date, type } = body;
  const notValidEntry = (id !== undefined && !id) || !name || !type || (type !== "calendar" && type !== "common_decision");
  const noEventDate = type === "calendar" && !date;

  if (notValidEntry) {
    return { error: "ID (for PUT), name, and valid type ('calendar' or 'common_decision') are required" };
  }
  if (noEventDate) {
    return { error: "Date is required for 'calendar' events" };
  }
  return null; // Request is valid
}

async function updateEvent(id: string, updateData: { name: string; type: string; date?: string }) {
  const collection = await getEventsCollection();
  const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
  if (result.matchedCount === 0) {
    return null; // Event not found or not modified
  }
  const updatedEvent = await collection.findOne({ _id: new ObjectId(id) });
  return updatedEvent;
}

export async function GET() {
  const collection = await getEventsCollection();
  const events = await collection.find({}).toArray();
  const result = events.map((e: any) => ({
    id: e._id.toString(),
    name: e.name,
    date: e.date,
    type: e.type,
  }));
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const validationError = isValidRequest(body);
  if (validationError) {
    return NextResponse.json(validationError, { status: 400 });
  }
  const { name, date, type } = body;
  const collection = await getEventsCollection();
  const res = await collection.insertOne({ name, date, type });
  return NextResponse.json({ id: res.insertedId.toString(), name, date, type }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const url = req.nextUrl;
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }
  const collection = await getEventsCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id as string) });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true }, { status: 200 });
}

export async function PUT(req: NextRequest) {
  const url = req.nextUrl;
  const id = url.searchParams.get("id");
  const body = await req.json();
  const validationError = isValidRequest(body, id);
  if (validationError) {
    return NextResponse.json(validationError, { status: 400 });
  }
  const { name, date, type } = body;
  const updateData: { name: string; type: string; date?: string } = { name, type };
  if (date) updateData.date = date;
  const updatedEvent = await updateEvent(id as string, updateData);
  if (!updatedEvent) {
    return NextResponse.json({ error: "Event not found or could not be updated" }, { status: 404 });
  }
  return NextResponse.json({ id: updatedEvent._id.toString(), name: updatedEvent.name, date: updatedEvent.date, type: updatedEvent.type }, { status: 200 });
}
