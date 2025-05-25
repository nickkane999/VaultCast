import { NextResponse, NextRequest } from "next/server";
import { getCollection } from "@/lib/server/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const collection = await getCollection("emailer_agent");

    // Fetch emails that are not deleted and have a response
    const emails = await collection
      .find({
        $and: [{ response: { $exists: true, $ne: "" } }, { $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }] }],
      })
      .sort({ timestamp: -1 })
      .limit(50) // Limit to last 50 emails
      .toArray();

    const transformedEmails = emails.map((email) => ({
      _id: email._id.toString(),
      emailTitle: email.emailTitle || "Untitled Email",
      response: email.response,
      timestamp: email.timestamp,
      requestType: email.requestType,
      question: email.question,
      isDeleted: email.isDeleted || false,
    }));

    return NextResponse.json({ emails: transformedEmails });
  } catch (error) {
    console.error("Error fetching past emails:", error);
    return NextResponse.json({ error: "Failed to fetch past emails" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { emailId } = body;

    if (!emailId) {
      return NextResponse.json({ error: "Email ID is required" }, { status: 400 });
    }

    const collection = await getCollection("emailer_agent");

    // Mark the email as deleted instead of actually deleting it
    const result = await collection.updateOne({ _id: new ObjectId(emailId) }, { $set: { isDeleted: true, deletedAt: new Date() } });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Email deleted successfully" });
  } catch (error) {
    console.error("Error deleting email:", error);
    return NextResponse.json({ error: "Failed to delete email" }, { status: 500 });
  }
}
