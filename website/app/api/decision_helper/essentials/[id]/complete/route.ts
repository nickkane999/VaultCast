import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/server/mongodb";
import { ObjectId } from "mongodb";
import { revalidateTag } from "next/cache";
import { parseISO, addDays, format } from "date-fns";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Essential ID is required" }, { status: 400 });
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid essential ID format" }, { status: 400 });
    }

    const collection = await getCollection("decision_helper_essentials");
    const essential = await collection.findOne({ _id: new ObjectId(id) });
    if (!essential) {
      return NextResponse.json({ error: "Essential not found" }, { status: 404 });
    }

    const currentDueDate = parseISO(essential.due_date);
    const newDueDate = addDays(currentDueDate, essential.interval);
    const formattedNewDueDate = format(newDueDate, "yyyy-MM-dd");
    const newCompletedTimes = (essential.completed_times || 0) + 1;
    const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: { completed_times: newCompletedTimes, due_date: formattedNewDueDate } });
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Essential not found" }, { status: 404 });
    }

    const updatedEssential = await collection.findOne({ _id: new ObjectId(id) });

    if (!updatedEssential) {
      return NextResponse.json({ error: "Essential completed but not found afterwards" }, { status: 500 });
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
    console.error(`Error completing essential with ID ${params?.id}:`, error);
    return NextResponse.json({ error: "Failed to complete essential" }, { status: 500 });
  }
}
