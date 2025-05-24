import OpenAI from "openai";
import { NextResponse } from "next/server";

const getOpenAIClient = () => {
  if (!process.env.CHATGPT_API_KEY) {
    throw new Error("CHATGPT_API_KEY is not set in the environment variables.");
  }
  return new OpenAI({ apiKey: process.env.CHATGPT_API_KEY });
};

export async function sendEmailViaInternalSender({ to, subject, body }: { to: string; subject: string; body: string }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const internalGmailSenderUrl = `${appUrl}/api/ai_emailer/gmail_sender`;

  console.log(`Attempting to call internal Gmail sender at: ${internalGmailSenderUrl}`);

  try {
    const response = await fetch(internalGmailSenderUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, body }),
    });

    if (!response.ok) {
      let errorResult;
      try {
        errorResult = await response.json();
      } catch (e) {
        const errorText = await response.text();
        throw new Error(errorText || `Internal Gmail sender request failed: ${response.status} ${response.statusText}`);
      }
      throw new Error(errorResult.error || `Internal Gmail sender request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`Call to internal Gmail sender successful.`);

    return {
      success: true,
      message: result.message || "Email processed by internal sender.",
      details: result,
    };
  } catch (error: any) {
    console.error("Error in sendEmailViaInternalSender:", error.message);
    return {
      success: false,
      message: "Failed to send email via internal sender.",
      error: error.message || error.toString(),
    };
  }
}

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
