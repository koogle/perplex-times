import { NextResponse } from "next/server";
import { Perplexity } from "@/lib/perplexity";
import { xai } from "@/lib/xai";
import { generateObject } from "ai";
import { NewsResponseSchema } from "@/types/news";

const perplexity = new Perplexity();

export async function POST(req: Request) {
  try {
    // Validate API keys
    if (!process.env.PERPLEXITY_API_KEY || !process.env.XAI_API_KEY) {
      return NextResponse.json(
        { error: "API keys not configured. Please set PERPLEXITY_API_KEY and XAI_API_KEY environment variables." },
        { status: 500 }
      );
    }

    // Parse and validate request body
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { type, section } = body;

    // Validate required fields
    if (!type || typeof type !== 'string') {
      return NextResponse.json(
        { error: "Missing or invalid 'type' field. Expected a string." },
        { status: 400 }
      );
    }

    try {
      // Step 1: Get raw news data from Perplexity
      const prompt = type === "breaking" 
        ? "Generate 5 of the most important breaking news headlines from the last 24 hours. For each headline, provide a brief 2-3 sentence summary. Format as: HEADLINE: [headline text] SUMMARY: [summary text]"
        : `Generate 5 current news headlines for the ${section} section. For each headline, provide a brief 2-3 sentence summary. Format as: HEADLINE: [headline text] SUMMARY: [summary text]`;

      const rawNews = await perplexity.completion({
        messages: [{ role: "user", content: prompt }]
      });

      // Step 2: Use XAI to structure the data
      const result = await generateObject({
        model: xai('grok-beta'),
        system: "Extract headlines and summaries from the provided text into a structured format. Each news item should have a headline, summary, and other metadata.",
        prompt: rawNews,
        schema: NewsResponseSchema,
      });

      return result.toJsonResponse();
    } catch (error) {
      console.error("News Generation Error:", error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to generate news content" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
