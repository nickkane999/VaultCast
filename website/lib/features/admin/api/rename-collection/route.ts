import { NextRequest, NextResponse } from "next/server";
import { renameCollection } from "@/lib/server/mongodb";

export async function POST(request: NextRequest) {
  try {
    const { oldName, newName } = await request.json();

    if (!oldName || !newName) {
      return NextResponse.json({ error: "Both oldName and newName are required" }, { status: 400 });
    }

    await renameCollection(oldName, newName);

    return NextResponse.json({
      success: true,
      message: `Collection renamed from "${oldName}" to "${newName}"`,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to rename collection" }, { status: 500 });
  }
}
