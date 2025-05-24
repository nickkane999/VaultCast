import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/server/mongodb";
import { ObjectId } from "mongodb";
import { revalidateTag } from "next/cache";

// Helper function to validate request body for creating/updating essentials
function isValidEssentialRequest(body: any, id?: string | null) {
  const { title, description, completed_times, due_date, interval } = body;

  if (id !== undefined && !id) {
    return { error: "ID is required for PUT request" };
  }
  if (typeof title !== "string" || title.trim().length === 0) {
    return { error: "Title is required and must be a non-empty string" };
  }
  if (typeof description !== "string" || description.trim().length === 0) {
    return { error: "Description is required and must be a non-empty string" };
  }
  if (typeof completed_times !== "number" || completed_times < 0) {
    // Allow completed_times to be absent or 0 for POST, required for PUT
    if (id !== undefined && (typeof completed_times !== "number" || completed_times < 0)) {
      return { error: "Completed_times is required for PUT and must be a non-negative number" };
    }
    if (id === undefined && completed_times !== undefined && (typeof completed_times !== "number" || completed_times < 0)) {
      return { error: "Completed_times must be a non-negative number if provided" };
    }
  }
  if (typeof due_date !== "string" || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(due_date)) {
    return { error: "Due_date is required and must be in YYYY-MM-DD format" };
  }
  if (typeof interval !== "number" || interval <= 0) {
    return { error: "Interval is required and must be a positive number" };
  }

  return null; // Request is valid
}

// GET handler to fetch all essentials
export async function GET() {
  try {
    const collection = await getCollection("essentials");
    const essentials = await collection.find({}).toArray();
    const result = essentials.map((e: any) => ({
      id: e._id.toString(),
      title: e.title,
      description: e.description,
      completed_times: e.completed_times,
      due_date: e.due_date,
      interval: e.interval,
    }));
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error fetching essentials:", error);
    return NextResponse.json({ error: "Failed to fetch essentials" }, { status: 500 });
  }
}

// POST handler to create a new essential
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validationError = isValidEssentialRequest(body);
    if (validationError) {
      return NextResponse.json(validationError, { status: 400 });
    }
    const { title, description, completed_times, due_date, interval } = body;
    const doc = {
      title,
      description,
      completed_times: completed_times !== undefined ? completed_times : 0, // Default to 0 if not provided
      due_date,
      interval,
    };

    const collection = await getCollection("essentials");
    const res = await collection.insertOne(doc);
    revalidateTag("essentials");
    return NextResponse.json({ id: res.insertedId.toString(), ...doc }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating essential:", error);
    return NextResponse.json({ error: "Failed to create essential" }, { status: 500 });
  }
}

// DELETE handler to delete an essential by ID
export async function DELETE(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    const collection = await getCollection("essentials");
    const result = await collection.deleteOne({ _id: new ObjectId(id as string) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Essential not found" }, { status: 404 });
    }
    revalidateTag("essentials");
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting essential with ID ${req.nextUrl.searchParams.get("id")}:`, error);
    return NextResponse.json({ error: "Failed to delete essential" }, { status: 500 });
  }
}

// PUT handler to update an essential by ID
export async function PUT(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const id = url.searchParams.get("id");
    const body = await req.json();
    const validationError = isValidEssentialRequest(body, id);
    if (validationError) {
      return NextResponse.json(validationError, { status: 400 });
    }

    if (!id) {
      // This case should be caught by isValidEssentialRequest, but as a fallback
      return NextResponse.json({ error: "ID is required for PUT request" }, { status: 400 });
    }

    const { title, description, completed_times, due_date, interval } = body;
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (completed_times !== undefined) updateData.completed_times = completed_times;
    if (due_date !== undefined) updateData.due_date = due_date;
    if (interval !== undefined) updateData.interval = interval;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields provided for update" }, { status: 400 });
    }

    const collection = await getCollection("essentials");
    const result = await collection.updateOne({ _id: new ObjectId(id as string) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Essential not found" }, { status: 404 });
    }

    // Fetch the updated document to return it
    const updatedEssential = await collection.findOne({ _id: new ObjectId(id as string) });

    if (!updatedEssential) {
      // This case should theoretically not happen if matchedCount > 0, but as a safeguard
      return NextResponse.json({ error: "Essential updated but not found afterwards" }, { status: 500 });
    }

    revalidateTag("essentials");
    return NextResponse.json(
      {
        id: updatedEssential._id.toString(),
        title: updatedEssential.title,
        description: updatedEssential.description,
        completed_times: updatedEssential.completed_times,
        due_date: updatedEssential.due_date,
        interval: updatedEssential.interval,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`Error updating essential with ID ${req.nextUrl.searchParams.get("id")}:`, error);
    return NextResponse.json({ error: "Failed to update essential" }, { status: 500 });
  }
}
