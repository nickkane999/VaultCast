import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getCollection } from '@/lib/server/mongodb';
import { ObjectId, Collection, Document } from "mongodb";
import { sendEmailViaInternalSender } from '@/lib/features/ai_emailer/api/utils/emailSender';

export async function POST(request: Request) {
  if (!process.env.CHATGPT_API_KEY) {
    return NextResponse.json({ error: "CHATGPT_API_KEY is not set in the environment variables." }, { status: 500 });
  }
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: "MONGODB_URI is not set in the environment variables." }, { status: 500 });
  }

  let insertedId: ObjectId | null = null;
  let collection: Collection<Document> | undefined;

  try {
    const body = await request.json();
    const { action, requestType, emailTitle, question, originalResponse, updateRequest, emailBody, to, prompt, systemPrompt, model, files } = body;

    collection = await getCollection("emailer_agent");

    if (action === "SendEmailDirectly") {
      if (!emailBody || !emailTitle || !to) {
        return NextResponse.json({ error: "Missing parameters for sending email." }, { status: 400 });
      }
      const sendResult = await sendEmailViaInternalSender({
        to: to,
        subject: emailTitle,
        body: emailBody,
      });
      if (sendResult.success) {
        console.log("Email sent directly via internal sender.");
        return NextResponse.json({ message: "Email sent successfully.", details: sendResult.details });
      } else {
        return NextResponse.json({ error: "Failed to send email via internal sender.", details: sendResult.error }, { status: 500 });
      }
    }

    const doc: any = { action, timestamp: new Date(), response: "" };
    if (action === "Draft") {
      doc.requestType = requestType;
      doc.emailTitle = emailTitle;
      doc.question = question;
    } else if (action === "Update") {
      doc.originalResponse = originalResponse;
      doc.updateRequest = updateRequest;
      if (emailTitle) doc.emailTitle = emailTitle;
    }

    const insertResult = await collection.insertOne(doc);
    insertedId = insertResult.insertedId;
    console.log(`A document was inserted/updated with the _id: ${insertedId} for action: ${action}`);

    let userPromptContent = "";
    if (action === "Draft") {
      userPromptContent = prompt || `Generate an email with the following details:\nRequest Type: ${requestType}\nQuestion: ${question}\nAction: ${action}`;
    } else if (action === "Update") {
      userPromptContent = prompt || `The user wants to update an existing email draft. \nOriginal Draft:\n${originalResponse}\n\nUser's Update Request: ${updateRequest}\n\nPlease provide the revised email draft based on the update request.`;
    }

    const openaiClient = new OpenAI({ apiKey: process.env.CHATGPT_API_KEY });
    const stream = await openaiClient.chat.completions.create({
      model: model || "gpt-4.1-nano",
      messages: [
        { role: "system", content: systemPrompt || "You are an AI email assistant." },
        { role: "user", content: userPromptContent },
      ],
      stream: true,
    });

    let fullResponse = "";
    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          fullResponse += content;
          controller.enqueue(encoder.encode(content));
        }
        controller.close();

        if (insertedId && collection) {
          try {
            await collection.updateOne({ _id: insertedId }, { $set: { response: fullResponse } });
            console.log(`Document with _id: ${insertedId} updated with full response.`);
          } catch (dbError) {
            console.error("Error updating document with full response:", dbError);
          }
        }
      },
    });

    return new Response(readableStream);
  } catch (error: any) {
    console.error("Error handling AI emailer request:", error);
    if (insertedId && collection) {
      try {
        await collection.updateOne({ _id: insertedId }, { $set: { error: error.message || "An error occurred during generation/update." } });
      } catch (dbError) {
        console.error("Error updating document with error status:", dbError);
      }
    }
    return NextResponse.json({ error: error.message || "Error processing request." }, { status: 500 });
  }
}
