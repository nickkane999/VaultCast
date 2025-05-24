import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/server/mongodb";
import { ObjectId } from "mongodb";
import { revalidateTag } from "next/cache";

function isValidRequest(body: any, id?: string | null) {
  const { name, description, dueDate } = body;
  const notValidEntry = (id !== undefined && !id) || !name || description === undefined || dueDate === undefined;

  if (notValidEntry) {
    return { error: "ID (for PUT), name, description, and dueDate are required" };
  }
  // Optional: Add date format validation for dueDate if necessary

  return null; // Request is valid
}

async function updateProject(id: string, updateData: { name?: string; description?: string; dueDate?: string; is_completed?: boolean }) {
  const collection = await getCollection("projects");
  const objectId = new ObjectId(id);
  const result = await collection.updateOne({ _id: objectId }, { $set: updateData });
  if (result.matchedCount === 0) {
    return null; // Project not found or not modified
  }
  const updatedProject = await collection.findOne({ _id: objectId });
  return updatedProject;
}

export async function GET() {
  const collection = await getCollection("projects");
  const projects = await collection.find({}).toArray();
  const result = projects.map((p: any) => ({
    id: p._id.toString(),
    name: p.name,
    description: p.description,
    dueDate: p.dueDate,
    is_completed: p.is_completed || false,
  }));
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const validationError = isValidRequest(body);
  if (validationError) {
    return NextResponse.json(validationError, { status: 400 });
  }
  const { name, description, dueDate, is_completed = false } = body;
  const doc: any = { name, description, dueDate, is_completed };

  const collection = await getCollection("projects");
  const res = await collection.insertOne(doc);
  const insertedProject = await collection.findOne({ _id: res.insertedId });

  revalidateTag("projects");

  return NextResponse.json(
    {
      id: res.insertedId.toString(),
      name: insertedProject?.name,
      description: insertedProject?.description,
      dueDate: insertedProject?.dueDate,
      is_completed: insertedProject?.is_completed || false,
    },
    { status: 201 }
  );
}

export async function DELETE(req: NextRequest) {
  const url = req.nextUrl;
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }
  const collection = await getCollection("projects");
  const result = await collection.deleteOne({ _id: new ObjectId(id as string) });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  revalidateTag("projects");

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
  const { name, description, dueDate, is_completed } = body;
  const updateData: { name?: string; description?: string; dueDate?: string; is_completed?: boolean } = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (dueDate !== undefined) updateData.dueDate = dueDate;
  if (is_completed !== undefined) updateData.is_completed = is_completed;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No valid fields provided for update" }, { status: 400 });
  }

  const updatedProject = await updateProject(id as string, updateData);
  if (!updatedProject) {
    return NextResponse.json({ error: "Project not found or could not be updated" }, { status: 404 });
  }

  revalidateTag("projects");

  return NextResponse.json(
    {
      id: updatedProject._id.toString(),
      name: updatedProject.name,
      description: updatedProject.description,
      dueDate: updatedProject.dueDate,
      is_completed: updatedProject.is_completed || false,
    },
    { status: 200 }
  );
}
