import OpenAI from "openai";
import { NextResponse } from "next/server";
import { sendEmailViaInternalSender } from '@/lib/features/ai_emailer/api/utils/emailSender';

const getOpenAIClient = () => {
  if (!process.env.CHATGPT_API_KEY) {
    throw new Error("CHATGPT_API_KEY is not set in the environment variables.");
  }
  return new OpenAI({ apiKey: process.env.CHATGPT_API_KEY });
};

export async function POST(request: Request) {
  try {
    const { to, subject, body } = await request.json();

    if (!to || !subject || !body) {
      return NextResponse.json({ error: "Missing required fields: to, subject, and body are required" }, { status: 400 });
    }

    const result = await sendEmailViaInternalSender({ to, subject, body });

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: result.message, details: result.error }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Error in ChatGPT Gmail API route:", error);
    return NextResponse.json({ error: "Internal server error", details: error.message || error }, { status: 500 });
  }
}
