import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/app/api/mongodb";
import { ObjectId } from "mongodb";

function isValidRequest(body: any, id?: string | null) {
  const { name, date, type, is_completed, tags, startTime, endTime, attended, projectId } = body;
  const notValidEntry = (id !== undefined && !id) || !name || !type || (type !== "calendar" && type !== "common_decision" && type !== "task");
  const noEventDate = type === "calendar" && !date;
  const noTaskCompletedStatus = type === "task" && typeof is_completed !== "boolean";
  const invalidTags = tags !== undefined && (!Array.isArray(tags) || !tags.every((tag) => typeof tag === "string"));
  const invalidTimes = (startTime !== undefined && typeof startTime !== "string") || (endTime !== undefined && typeof endTime !== "string");
  const invalidAttended = attended !== undefined && typeof attended !== "boolean";
  const invalidProjectId = projectId !== undefined && projectId !== null && typeof projectId !== "string";

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
  if (invalidTimes) {
    return { error: "'startTime' and 'endTime' must be strings if provided" };
  }
  if (invalidAttended) {
    return { error: "'attended' must be a boolean if provided" };
  }
  if (invalidProjectId) {
    return { error: "'projectId' must be a string if provided" };
  }

  return null; // Request is valid
}

async function updateEvent(id: string, updateData: { name?: string; type?: string; date?: string; is_completed?: boolean; tags?: string[]; startTime?: string; endTime?: string; attended?: boolean; projectId?: string | null }) {
  const collection = await getCollection("tasks");
  const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
  if (result.matchedCount === 0) {
    return null; // Event not found or not modified
  }
  const updatedEvent = await collection.findOne({ _id: new ObjectId(id) });
  return updatedEvent;
}

export async function GET() {
  const collection = await getCollection("tasks");
  const events = await collection.find({}).toArray();
  const result = events.map((e: any) => ({
    id: e._id.toString(),
    name: e.name,
    date: e.date,
    type: e.type,
    is_completed: e.is_completed,
    tags: e.tags,
    startTime: e.startTime,
    endTime: e.endTime,
    attended: e.attended,
    projectId: e.projectId,
  }));
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const validationError = isValidRequest(body);
  if (validationError) {
    return NextResponse.json(validationError, { status: 400 });
  }
  const { name, date, type, is_completed, tags, startTime, endTime, attended, projectId } = body;
  const doc: any = { name, type };
  if (type === "calendar") {
    doc.date = date;
    if (startTime !== undefined) doc.startTime = startTime;
    if (endTime !== undefined) doc.endTime = endTime;
  }
  if (type === "task") {
    doc.is_completed = is_completed;
    if (projectId !== undefined) doc.projectId = projectId;
  }
  if (tags !== undefined) doc.tags = tags;
  if (attended !== undefined) doc.attended = attended;

  const collection = await getCollection("tasks");
  const res = await collection.insertOne(doc);
  return NextResponse.json({ id: res.insertedId.toString(), ...doc }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const url = req.nextUrl;
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }
  const collection = await getCollection("tasks");
  const result = await collection.deleteOne({ _id: new ObjectId(id as string) });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
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
  const { name, date, type, is_completed, tags, startTime, endTime, attended, projectId } = body;
  const updateData: { name?: string; type?: string; date?: string; is_completed?: boolean; tags?: string[]; startTime?: string; endTime?: string; attended?: boolean; projectId?: string | null } = {};
  if (name !== undefined) updateData.name = name;
  if (type !== undefined) updateData.type = type;
  if (type === "calendar" && date !== undefined) updateData.date = date;
  if (type === "task") {
    if (is_completed !== undefined) updateData.is_completed = is_completed;
    if (projectId !== undefined) updateData.projectId = projectId;
  }
  if (tags !== undefined) updateData.tags = tags;
  if (type === "calendar") {
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;
  }
  if (attended !== undefined) updateData.attended = attended;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No valid fields provided for update" }, { status: 400 });
  }

  const updatedEvent = await updateEvent(id as string, updateData);
  if (!updatedEvent) {
    return NextResponse.json({ error: "Task not found or could not be updated" }, { status: 404 });
  }
  return NextResponse.json(
    {
      id: updatedEvent._id.toString(),
      name: updatedEvent.name,
      date: updatedEvent.date,
      type: updatedEvent.type,
      is_completed: updatedEvent.is_completed,
      startTime: updatedEvent.startTime,
      endTime: updatedEvent.endTime,
      tags: updatedEvent.tags,
      attended: updatedEvent.attended,
      projectId: updatedEvent.projectId,
    },
    { status: 200 }
  );
}
