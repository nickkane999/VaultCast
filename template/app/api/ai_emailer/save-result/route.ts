import { NextResponse } from "next/server";
import { getCollection } from '@/lib/server/mongodb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, requestType, emailTitle, question, response, timestamp } = body;

    if (!response) {
      return NextResponse.json({ error: "Response content is required" }, { status: 400 });
    }

    const collection = await getCollection("emailer_agent");

    const doc = {
      action: action || "Draft",
      requestType: requestType || "Raw HTML",
      emailTitle: emailTitle || "HTML Design Email",
      question: question || "",
      response: response,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    };

    const insertResult = await collection.insertOne(doc);
    console.log(`HTML Design result saved with _id: ${insertResult.insertedId}`);

    return NextResponse.json({
      success: true,
      id: insertResult.insertedId,
      message: "HTML Design result saved successfully",
    });
  } catch (error: any) {
    console.error("Error saving HTML design result:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to save HTML design result",
      },
      { status: 500 }
    );
  }
}
