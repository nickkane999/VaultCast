import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: Request) {
  if (!process.env.CHATGPT_API_KEY) {
    return NextResponse.json({ error: "CHATGPT_API_KEY is not set in the environment variables." }, { status: 500 });
  }

  const client = new OpenAI({ apiKey: process.env.CHATGPT_API_KEY });

  try {
    const { prompt, systemPrompt, model, files } = await request.json();

    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
        // TODO: Add file content to the messages if needed
      ],
    });

    return NextResponse.json({ response: response.choices[0]?.message?.content || "No response from AI." });
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return NextResponse.json({ error: "Error getting response from AI." }, { status: 500 });
  }
}
