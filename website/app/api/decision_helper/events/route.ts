import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/app/api/mongodb";
import { ObjectId } from "mongodb";
import { revalidateTag } from "next/cache";

function isValidRequest(body: any, id?: string | null) {
  const { name, date, is_completed, tags, startTime, endTime, attended, projectId } = body;
  const notValidEntry = (id !== undefined && !id) || !name || !date;
  const invalidTimes = (startTime !== undefined && typeof startTime !== "string") || (endTime !== undefined && typeof endTime !== "string");
  const invalidAttended = attended !== undefined && typeof attended !== "boolean";

  if (notValidEntry) {
    return { error: "ID (for PUT), name, and date are required" };
  }
  if (invalidTimes) {
    return { error: "'startTime' and 'endTime' must be strings if provided" };
  }
  if (invalidAttended) {
    return { error: "'attended' must be a boolean if provided" };
  }

  return null; // Request is valid
}

async function updateEvent(id: string, updateData: { name?: string; date?: string; startTime?: string; endTime?: string; attended?: boolean }) {
  const collection = await getCollection("events");
  const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
  if (result.matchedCount === 0) {
    return null; // Event not found or not modified
  }
  const updatedEvent = await collection.findOne({ _id: new ObjectId(id) });
  return updatedEvent;
}

export async function GET() {
  const collection = await getCollection("events");
  const events = await collection.find({}).toArray();
  const result = events.map((e: any) => ({
    id: e._id.toString(),
    name: e.name,
    date: e.date,
    startTime: e.startTime,
    endTime: e.endTime,
    attended: e.attended,
  }));
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const validationError = isValidRequest(body);
  if (validationError) {
    return NextResponse.json(validationError, { status: 400 });
  }
  const { name, date, startTime, endTime, attended } = body;
  const doc: any = { name, date };
  if (startTime !== undefined) doc.startTime = startTime;
  if (endTime !== undefined) doc.endTime = endTime;
  if (attended !== undefined) doc.attended = attended;

  const collection = await getCollection("events");
  const res = await collection.insertOne(doc);
  revalidateTag("events");
  return NextResponse.json({ id: res.insertedId.toString(), ...doc }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const url = req.nextUrl;
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }
  const collection = await getCollection("events");
  const result = await collection.deleteOne({ _id: new ObjectId(id as string) });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  revalidateTag("events");
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
  const { name, date, startTime, endTime, attended } = body;
  const updateData: { name?: string; date?: string; startTime?: string; endTime?: string; attended?: boolean } = {};
  if (name !== undefined) updateData.name = name;
  if (date !== undefined) updateData.date = date;
  if (startTime !== undefined) updateData.startTime = startTime;
  if (endTime !== undefined) updateData.endTime = endTime;
  if (attended !== undefined) updateData.attended = attended;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No valid fields provided for update" }, { status: 400 });
  }

  const updatedEvent = await updateEvent(id as string, updateData);
  if (!updatedEvent) {
    return NextResponse.json({ error: "Event not found or could not be updated" }, { status: 404 });
  }
  revalidateTag("events");
  return NextResponse.json(
    {
      id: updatedEvent._id.toString(),
      name: updatedEvent.name,
      date: updatedEvent.date,
      startTime: updatedEvent.startTime,
      endTime: updatedEvent.endTime,
      attended: updatedEvent.attended,
    },
    { status: 200 }
  );
}
