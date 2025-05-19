import { NextRequest, NextResponse } from "next/server";
import { getEventsCollection } from "@/app/api/mongodb";
import { ObjectId } from "mongodb";

function isValidRequest(body: any, id?: string | null) {
  const { name, date, type, is_completed, tags } = body;
  const notValidEntry = (id !== undefined && !id) || !name || !type || (type !== "calendar" && type !== "common_decision" && type !== "task");
  const noEventDate = type === "calendar" && !date;
  const noTaskCompletedStatus = type === "task" && typeof is_completed !== "boolean";
  const invalidTags = tags !== undefined && (!Array.isArray(tags) || !tags.every((tag) => typeof tag === "string"));

  if (notValidEntry) {
    return { error: "ID (for PUT), name, and valid type ('calendar', 'common_decision', or 'task') are required" };
  }
  if (noEventDate) {
    return { error: "Date is required for 'calendar' events" };
  }
  if (noTaskCompletedStatus) {
    return { error: "'is_completed' (boolean) is required for 'task' events" };
  }
  if (invalidTags) {
    return { error: "'tags' must be an array of strings if provided" };
  }
  return null; // Request is valid
}

async function updateEvent(id: string, updateData: { name?: string; type?: string; date?: string; is_completed?: boolean }) {
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
    is_completed: e.is_completed,
    tags: e.tags,
  }));
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const validationError = isValidRequest(body);
  if (validationError) {
    return NextResponse.json(validationError, { status: 400 });
  }
  const { name, date, type, is_completed, tags } = body;
  const doc: any = { name, type };
  if (type === "calendar") doc.date = date;
  if (type === "task") doc.is_completed = is_completed;
  if (tags !== undefined) doc.tags = tags;
  const collection = await getEventsCollection();
  const res = await collection.insertOne(doc);
  return NextResponse.json({ id: res.insertedId.toString(), ...doc }, { status: 201 });
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
  const { name, date, type, is_completed, tags } = body;
  const updateData: { name?: string; type?: string; date?: string; is_completed?: boolean; tags?: string[] } = {};
  if (name) updateData.name = name;
  if (type) updateData.type = type;
  if (type === "calendar" && date !== undefined) updateData.date = date;
  if (type === "task" && is_completed !== undefined) updateData.is_completed = is_completed;
  if (type === "task" && tags !== undefined) updateData.tags = tags;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No valid fields provided for update" }, { status: 400 });
  }

  const updatedEvent = await updateEvent(id as string, updateData);
  if (!updatedEvent) {
    return NextResponse.json({ error: "Event not found or could not be updated" }, { status: 404 });
  }
  return NextResponse.json({ id: updatedEvent._id.toString(), name: updatedEvent.name, date: updatedEvent.date, type: updatedEvent.type, is_completed: updatedEvent.is_completed }, { status: 200 });
}
