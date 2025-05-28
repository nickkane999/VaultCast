import OpenAI from "openai";
import axios from "axios";

export interface AnalysisRequest {
  imageBuffer?: Buffer;
  imageUrl?: string;
  filename?: string;
  mimetype?: string;
  category: string;
  customPrompt?: string;
  analysisTypes: string[];
}

export interface AnalysisResult {
  id: string;
  category: string;
  prompt: string;
  results: {
    openai?: OpenAIResult;
    tensorflow?: TensorFlowResult;
    google?: GoogleVisionResult;
    aws?: AWSRekognitionResult;
  };
  metadata: {
    processingTime: number;
    imageSize?: string;
    imageType?: string;
    timestamp: string;
  };
}

interface OpenAIResult {
  analysis: string;
  confidence: number;
  processingTime: number;
}

interface TensorFlowResult {
  predictions: Array<{
    label: string;
    confidence: number;
  }>;
  processingTime: number;
}

interface GoogleVisionResult {
  labels: Array<{
    description: string;
    score: number;
  }>;
  text?: string;
  faces?: number;
  processingTime: number;
}

interface AWSRekognitionResult {
  labels: Array<{
    name: string;
    confidence: number;
  }>;
  celebrities?: Array<{
    name: string;
    confidence: number;
  }>;
  processingTime: number;
}

export async function analyzeImage(request: AnalysisRequest): Promise<AnalysisResult> {
  const startTime = Date.now();
  const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const prompt = request.customPrompt || getDefaultPromptForCategory(request.category);
  const results: AnalysisResult["results"] = {};

  let imageData: string | Buffer;

  if (request.imageUrl) {
    imageData = request.imageUrl;
  } else if (request.imageBuffer) {
    imageData = request.imageBuffer;
  } else {
    throw new Error("No image data provided");
  }

  for (const analysisType of request.analysisTypes) {
    try {
      switch (analysisType) {
        case "openai":
          if (process.env.OPENAI_API_KEY) {
            results.openai = await analyzeWithOpenAI(imageData, prompt);
          }
          break;
        case "tensorflow":
          if (process.env.ENABLE_TENSORFLOW_MODELS === "true") {
            results.tensorflow = await analyzeWithTensorFlow(imageData);
          }
          break;
        case "google":
          if (process.env.GOOGLE_VISION_API_KEY) {
            results.google = await analyzeWithGoogleVision(imageData);
          }
          break;
        case "aws":
          if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
            results.aws = await analyzeWithAWSRekognition(imageData);
          }
          break;
      }
    } catch (error) {
      console.error(`Failed to analyze with ${analysisType}:`, error);
    }
  }

  const processingTime = Date.now() - startTime;

  return {
    id: analysisId,
    category: request.category,
    prompt,
    results,
    metadata: {
      processingTime,
      imageSize: request.imageBuffer ? getBufferSize(request.imageBuffer) : undefined,
      imageType: request.mimetype,
      timestamp: new Date().toISOString(),
    },
  };
}

async function analyzeWithOpenAI(imageData: string | Buffer, prompt: string): Promise<OpenAIResult> {
  const startTime = Date.now();

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  let imageUrl: string;

  if (Buffer.isBuffer(imageData)) {
    const base64 = imageData.toString("base64");
    imageUrl = `data:image/jpeg;base64,${base64}`;
  } else {
    imageUrl = imageData;
  }

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `${prompt}\n\nPlease provide a detailed and accurate analysis. Rate your confidence level from 1-10.`,
          },
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
              detail: "high",
            },
          },
        ],
      },
    ],
    max_tokens: 1000,
    temperature: 0.3,
  });

  const analysis = response.choices[0]?.message?.content || "No analysis available";
  const processingTime = Date.now() - startTime;

  const confidenceMatch = analysis.match(/confidence[:\s]*(\d+)/i);
  const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) / 10 : 0.8;

  return {
    analysis,
    confidence,
    processingTime,
  };
}

async function analyzeWithTensorFlow(imageData: string | Buffer): Promise<TensorFlowResult> {
  const startTime = Date.now();

  await new Promise((resolve) => setTimeout(resolve, 100));

  const mockPredictions = [
    { label: "object", confidence: 0.85 },
    { label: "scene", confidence: 0.72 },
  ];

  return {
    predictions: mockPredictions,
    processingTime: Date.now() - startTime,
  };
}

async function analyzeWithGoogleVision(imageData: string | Buffer): Promise<GoogleVisionResult> {
  const startTime = Date.now();

  await new Promise((resolve) => setTimeout(resolve, 150));

  const mockLabels = [
    { description: "Object", score: 0.9 },
    { description: "Scene", score: 0.8 },
  ];

  return {
    labels: mockLabels,
    processingTime: Date.now() - startTime,
  };
}

async function analyzeWithAWSRekognition(imageData: string | Buffer): Promise<AWSRekognitionResult> {
  const startTime = Date.now();

  await new Promise((resolve) => setTimeout(resolve, 200));

  const mockLabels = [
    { name: "Object", confidence: 90 },
    { name: "Scene", confidence: 80 },
  ];

  return {
    labels: mockLabels,
    processingTime: Date.now() - startTime,
  };
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

function getBufferSize(buffer: Buffer): string {
  const bytes = buffer.length;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
