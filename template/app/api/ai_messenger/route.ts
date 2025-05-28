import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  if (!process.env.CHATGPT_API_KEY) {
    return NextResponse.json({ error: "CHATGPT_API_KEY is not set in the environment variables." }, { status: 500 });
  }

  try {
    const { profileId, question, systemPrompt, files, model } = await req.json();

    // Basic validation
    if (!question || !systemPrompt) {
      return NextResponse.json({ error: "Missing required fields: question and systemPrompt" }, { status: 400 });
    }

    if (!profileId) {
      return NextResponse.json({ error: "Missing profileId" }, { status: 400 });
    }

    const openaiClient = new OpenAI({ apiKey: process.env.CHATGPT_API_KEY });

    // Create streaming response
    const stream = await openaiClient.chat.completions.create({
      model: model || "gpt-4o-nano",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      stream: true,
    });

    // Create readable stream for the response
    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
          console.error("Error in streaming:", error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Error handling AI messenger request:", error);
    return NextResponse.json(
      {
        error: error.message || "Error getting response from AI.",
      },
      { status: 500 }
    );
  }
}
