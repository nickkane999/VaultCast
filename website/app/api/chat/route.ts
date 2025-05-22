import { NextResponse } from "next/server";
import { askAI } from "../chatgpt";

export async function POST(request: Request) {
  try {
    const { prompt, systemPrompt, model, files } = await request.json();

    const aiResponse = await askAI({ prompt, systemPrompt, model, files });

    return NextResponse.json({ response: aiResponse });
  } catch (error: any) {
    console.error("Error handling chat request:", error);
    return NextResponse.json({ error: error.message || "Error getting response from AI." }, { status: 500 });
  }
}
