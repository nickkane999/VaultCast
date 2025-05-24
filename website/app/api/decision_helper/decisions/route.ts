import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/app/api/mongodb";
import { ObjectId } from "mongodb";
import { revalidateTag } from "next/cache";

function isValidRequest(body: any, id?: string | null) {
  const { name } = body;
  const notValidEntry = (id !== undefined && !id) || !name;

  if (notValidEntry) {
    return { error: "ID (for PUT) and name are required" };
  }
  return null;
}

async function updateDecision(id: string, updateData: { name?: string }) {
  const collection = await getCollection("decisions");
  const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
  if (result.matchedCount === 0) {
    return null; // Decision not found or not modified
  }
  const updatedDecision = await collection.findOne({ _id: new ObjectId(id) });
  return updatedDecision;
}

export async function GET() {
  const collection = await getCollection("decisions");
  const decisions = await collection.find({}).toArray();
  const result = decisions.map((d: any) => ({
    id: d._id.toString(),
    name: d.name,
  }));
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const validationError = isValidRequest(body);
  if (validationError) {
    return NextResponse.json(validationError, { status: 400 });
  }
  const { name } = body;
  const doc: any = { name };

  const collection = await getCollection("decisions");
  const res = await collection.insertOne(doc);
  revalidateTag("decisions");
  return NextResponse.json({ id: res.insertedId.toString(), name: doc.name }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const url = req.nextUrl;
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }
  const collection = await getCollection("decisions");
  const result = await collection.deleteOne({ _id: new ObjectId(id as string) });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Decision not found" }, { status: 404 });
  }
  revalidateTag("decisions");
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
  const { name } = body;
  const updateData: { name?: string } = {};
  if (name !== undefined) updateData.name = name;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No valid fields provided for update" }, { status: 400 });
  }

  const updatedDecision = await updateDecision(id as string, updateData);
  if (!updatedDecision) {
    return NextResponse.json({ error: "Decision not found or could not be updated" }, { status: 404 });
  }
  revalidateTag("decisions");
  return NextResponse.json({ id: updatedDecision._id.toString(), name: updatedDecision.name }, { status: 200 });
}
