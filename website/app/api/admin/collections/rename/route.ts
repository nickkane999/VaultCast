import { NextRequest, NextResponse } from "next/server";
import { renameCollection } from "@/lib/server/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { oldName, newName } = await req.json();

    if (!oldName || !newName) {
      return NextResponse.json({ error: "Both oldName and newName are required" }, { status: 400 });
    }

    if (oldName === newName) {
      return NextResponse.json({ error: "New name must be different from current name" }, { status: 400 });
    }

    await renameCollection(oldName, newName);
    return NextResponse.json({ message: "Collection renamed successfully" });
  } catch (error) {
    console.error("Error renaming collection:", error);
    return NextResponse.json({ error: "Failed to rename collection" }, { status: 500 });
  }
}
