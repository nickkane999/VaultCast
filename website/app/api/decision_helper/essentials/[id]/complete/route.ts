import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/server/mongodb";
import { ObjectId } from "mongodb";
import { parseISO, addDays, format } from "date-fns"; // Import date-fns functions

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid Essential ID" }, { status: 400 });
    }

    const collection = await getCollection("essentials");
    const essential = await collection.findOne({ _id: new ObjectId(id) });

    if (!essential) {
      return NextResponse.json({ error: "Essential not found" }, { status: 404 });
    }

    // Calculate the new due date
    const currentDueDate = parseISO(essential.due_date);
    const newDueDate = addDays(currentDueDate, essential.interval);
    const formattedNewDueDate = format(newDueDate, "yyyy-MM-dd");

    // Increment completed times
    const newCompletedTimes = (essential.completed_times || 0) + 1;

    // Update the essential item
    const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: { completed_times: newCompletedTimes, due_date: formattedNewDueDate } });

    if (result.matchedCount === 0) {
      // This case should theoretically not happen if the essential was found initially
      return NextResponse.json({ error: "Failed to update essential" }, { status: 500 });
    }

    // Fetch the updated document to return the latest state
    const updatedEssential = await collection.findOne({ _id: new ObjectId(id) });

    if (!updatedEssential) {
      // This case should theoretically not happen if matchedCount > 0, but as a safeguard
      return NextResponse.json({ error: "Essential updated but not found afterwards" }, { status: 500 });
    }

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
    console.error(`Error completing essential with ID ${id}:`, error);
    return NextResponse.json({ error: "Failed to complete essential" }, { status: 500 });
  }
}
