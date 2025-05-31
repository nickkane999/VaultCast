import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { MarketingAnalysis, TrendKeyword, AffiliateOpportunity, CompetitorInsight, ActionItem } from "@/lib/features/marketing_links/types";
import { v4 as uuidv4 } from "uuid";

function generateGoogleTrendsUrl(keyword: string): string {
  const encodedKeyword = encodeURIComponent(keyword);
  return `https://trends.google.com/trends/explore?q=${encodedKeyword}&geo=US`;
}

function parseAIResponse(response: string): Partial<MarketingAnalysis> {
  try {
    const cleanResponse = response.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanResponse);
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    throw new Error("Invalid AI response format");
  }
}

export async function POST(request: NextRequest) {
  if (!process.env.CHATGPT_API_KEY) {
    return NextResponse.json({ error: "CHATGPT_API_KEY is not set in the environment variables." }, { status: 500 });
  }

  try {
    const { query, targetAudience, platform, budget, experience } = await request.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const prompt = `
    You are an expert affiliate marketing strategist. Analyze the following query and provide a comprehensive marketing strategy with trending keywords and affiliate opportunities.

    User Query: "${query}"
    Target Audience: ${targetAudience || "General audience"}
    Platform: ${platform || "Any platform"}
    Budget: ${budget || "Flexible"}
    Experience Level: ${experience || "Beginner"}

    Provide a JSON response with the following structure:
    {
      "keywords": [
        {
          "keyword": "string",
          "relatedQueries": ["string"],
          "searchVolume": "Low|Medium|High|Very High",
          "competition": "Low|Medium|High",
          "trend": "Rising|Stable|Declining"
        }
      ],
      "opportunities": [
        {
          "keyword": "string",
          "platform": "string",
          "productSuggestions": ["string"],
          "affiliatePrograms": [
            {
              "name": "string",
              "commission": "string",
              "url": "string",
              "description": "string",
              "pros": ["string"],
              "requirements": ["string"]
            }
          ],
          "marketingAngle": "string",
          "estimatedRevenue": "string"
        }
      ],
      "competitorInsights": [
        {
          "keyword": "string",
          "topCompetitors": ["string"],
          "gapOpportunities": ["string"],
          "recommendedStrategy": "string"
        }
      ],
      "actionPlan": [
        {
          "step": number,
          "title": "string",
          "description": "string",
          "timeEstimate": "string",
          "priority": "High|Medium|Low",
          "resources": ["string"]
        }
      ],
      "estimatedTimeToProfit": "string",
      "difficulty": "Beginner|Intermediate|Advanced"
    }

    Focus on:
    1. Finding 5-10 high-potential keywords with strong affiliate opportunities
    2. Identifying trending niches and gaps in the market
    3. Providing specific, actionable affiliate programs (Amazon Associates, ShareASale, CJ Affiliate, ClickBank, etc.)
    4. Creating a realistic step-by-step action plan
    5. Considering seasonal trends and current market conditions
    6. Providing specific product recommendations and marketing angles
    7. Estimating realistic revenue potential and timeframes

    Make sure all affiliate programs are real and currently active. Prioritize programs with good commission rates and reliable tracking.
    `;

    const openaiClient = new OpenAI({ apiKey: process.env.CHATGPT_API_KEY });
    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert affiliate marketing strategist with deep knowledge of Google Trends, SEO, and profitable affiliate programs. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    const parsedResponse = parseAIResponse(aiResponse);

    const keywords: TrendKeyword[] = (parsedResponse.keywords || []).map((keyword) => ({
      ...keyword,
      googleTrendsUrl: generateGoogleTrendsUrl(keyword.keyword),
    }));

    const opportunities: AffiliateOpportunity[] = (parsedResponse.opportunities || []).map((opp) => ({
      ...opp,
      id: uuidv4(),
    }));

    const analysis: MarketingAnalysis = {
      id: uuidv4(),
      query,
      keywords,
      opportunities,
      competitorInsights: parsedResponse.competitorInsights || [],
      actionPlan: parsedResponse.actionPlan || [],
      estimatedTimeToProfit: parsedResponse.estimatedTimeToProfit || "3-6 months",
      difficulty: parsedResponse.difficulty || "Intermediate",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Marketing analysis error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Analysis failed" }, { status: 500 });
  }
}
