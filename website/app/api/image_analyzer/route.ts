import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/server/mongodb";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  try {
    const { imageData, category, customPrompt } = await request.json();

    if (!imageData) {
      return NextResponse.json({ error: "No image data provided" }, { status: 400 });
    }

    if (!process.env.CHATGPT_API_KEY) {
      return NextResponse.json({ error: "ChatGPT API key not configured" }, { status: 500 });
    }

    const prompt = customPrompt || getDefaultPromptForCategory(category);
    const startTime = Date.now();

    // Use OpenAI directly for vision analysis (since chatgpt.ts doesn't support vision yet)
    // Current working vision models: "gpt-4o", "gpt-4o-mini", "gpt-4-turbo"
    // gpt-4-vision-preview is deprecated
    const client = new OpenAI({ apiKey: process.env.CHATGPT_API_KEY });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", // Using gpt-4o-mini for cost efficiency, can also use "gpt-4o" for better quality
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `${prompt}\n\nPlease provide a detailed and accurate analysis. If you're not certain about something, please indicate your level of confidence.`,
            },
            {
              type: "image_url",
              image_url: {
                url: imageData,
                detail: "high",
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    const processingTime = Date.now() - startTime;
    const result = response.choices[0]?.message?.content || "No analysis available";

    const analysisResult = {
      id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      imageData,
      category,
      prompt,
      result,
      timestamp: new Date().toISOString(),
      metadata: {
        processingTime,
        imageType: getImageTypeFromDataUrl(imageData),
        imageSize: getImageSizeFromDataUrl(imageData),
      },
    };

    // Store the analysis result in MongoDB
    try {
      const collection = await getCollection("image_analyses");
      await collection.insertOne({
        ...analysisResult,
        createdAt: new Date(),
        userId: "anonymous", // TODO: Add user authentication
      });
    } catch (dbError) {
      console.error("Failed to save analysis to database:", dbError);
      // Continue without failing the request
    }

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error("Image analysis error:", error);

    if (error instanceof Error) {
      if (error.message.includes("rate_limit")) {
        return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
      }
      if (error.message.includes("insufficient_quota")) {
        return NextResponse.json({ error: "API quota exceeded. Please check your OpenAI account." }, { status: 402 });
      }
    }

    return NextResponse.json({ error: "Failed to analyze image. Please try again." }, { status: 500 });
  }
}

// GET endpoint to retrieve analysis history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category");

    const collection = await getCollection("image_analyses");

    const filter: any = {};
    if (category && category !== "all") {
      filter.category = category;
    }

    const analyses = await collection.find(filter).sort({ createdAt: -1 }).limit(limit).toArray();

    // Remove MongoDB _id and convert to expected format
    const formattedAnalyses = analyses.map(({ _id, createdAt, userId, ...analysis }) => analysis);

    return NextResponse.json(formattedAnalyses);
  } catch (error) {
    console.error("Failed to retrieve analysis history:", error);
    return NextResponse.json({ error: "Failed to retrieve analysis history" }, { status: 500 });
  }
}

function getDefaultPromptForCategory(category: string): string {
  const prompts: Record<string, string> = {
    animals: "What type of animal is this and what breed? Provide detailed information about its characteristics.",
    celebrities: "Who is this person? Provide their name and notable works if you can identify them.",
    movies_tv: "What movie or TV show is this from? Describe the scene and its context.",
    objects: "What is this object and what is it used for? Provide details about its purpose and characteristics.",
    locations: "Where is this location? Be as specific as possible about the place and its significance.",
    food: "What dish is this and what cuisine is it from? Describe the ingredients and preparation.",
    art: "What art style or movement does this represent? Describe the techniques and cultural context.",
    general: "Describe everything you see in this image in detail. What is the main subject and context?",
  };

  return prompts[category] || prompts.general;
}

function getImageTypeFromDataUrl(dataUrl: string): string {
  const match = dataUrl.match(/^data:image\/([^;]+);/);
  return match ? match[1] : "unknown";
}

function getImageSizeFromDataUrl(dataUrl: string): string {
  try {
    const base64Data = dataUrl.split(",")[1];
    const binaryString = atob(base64Data);
    const bytes = binaryString.length;

    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  } catch {
    return "unknown";
  }
}
