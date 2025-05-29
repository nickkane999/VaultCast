import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { imageData, category, customPrompt } = await request.json();

    if (!imageData) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 });
    }

    // Determine the prompt based on category and custom prompt
    let prompt = customPrompt;
    if (!prompt) {
      // Default prompts based on category
      const categoryPrompts: Record<string, string> = {
        animals: "Identify this animal, including species, breed if applicable, and describe its characteristics, behavior, and any notable features.",
        celebrities: "Identify who this person is, including their name, profession, and notable works or achievements.",
        movies_tv: "Identify what movie or TV show this is from, describe the scene, and provide context about the characters or plot.",
        objects: "Identify this object, describe what it's used for, provide details about its materials, design, and any notable features.",
        locations: "Identify this location as specifically as possible, including geographical details, historical significance, and cultural context.",
        food: "Identify this food item, including the dish name, cuisine type, main ingredients, and preparation methods.",
        art: "Analyze this artwork, including the style, potential artist or period, techniques used, and cultural or historical context.",
        general: "Provide a detailed analysis of this image, describing everything you can observe and any insights about the content, context, or significance.",
      };

      prompt = categoryPrompts[category] || categoryPrompts.general;
    }

    const startTime = Date.now();

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
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
      temperature: 0.7,
    });

    const processingTime = Date.now() - startTime;
    const analysis = response.choices[0]?.message?.content;

    if (!analysis) {
      return NextResponse.json({ error: "No analysis generated" }, { status: 500 });
    }

    // Extract image metadata
    const imageSize = imageData.length;
    const imageType = imageData.substring(5, imageData.indexOf(";"));

    return NextResponse.json({
      analysis,
      confidence: 0.85, // Mock confidence score
      metadata: {
        imageSize: `${Math.round(imageSize / 1024)} KB`,
        imageType,
        processingTime,
      },
    });
  } catch (error: any) {
    console.error("Image analysis error:", error);

    if (error.code === "insufficient_quota") {
      return NextResponse.json({ error: "OpenAI API quota exceeded. Please try again later." }, { status: 429 });
    }

    return NextResponse.json({ error: "Failed to analyze image. Please try again." }, { status: 500 });
  }
}
