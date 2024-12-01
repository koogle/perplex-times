import { NextResponse } from "next/server";
import { Perplexity } from "@/lib/perplexity";
import { xai } from "@/lib/xai";
import { generateObject } from "ai";
import { NewsResponseSchema } from "@/types/news";
import { z } from "zod";

const perplexity = new Perplexity();

const RequestSchema = z.object({
  type: z.enum(["breaking", "section"]),
  section: z.string(),
  count: z.number().int().min(1).max(20).optional().default(1),
});

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

    try {
      const { type, section, count } = RequestSchema.parse(body);

      // Construct prompt based on type and count
      const prompt = type === "breaking" 
        ? `Generate ${count} of the most important breaking news headlines from the last 24 hours. For each headline, provide a brief 2-3 sentence summary. Format as: HEADLINE: [headline text] SUMMARY: [summary text]`
        : `Generate ${count} current news headlines for the ${section} section. For each headline, provide a brief 2-3 sentence summary. Format as: HEADLINE: [headline text] SUMMARY: [summary text]`;

      // Get raw news data from Perplexity
      const rawNews = await perplexity.completion({
        messages: [{ role: "user", content: prompt }]
      });

      // Use XAI to structure the data
      const xaiResponse = await generateObject({
        model: xai('grok-beta'),
        system: "Extract headlines and summaries from the provided text into a structured format. Each news item should have a headline, summary, and other metadata.",
        prompt: rawNews,
        schema: NewsResponseSchema,
      });

      // Extract the articles from the XAI response object
      const structuredData = xaiResponse?.object;

      // Ensure we have a valid response with articles
      if (!structuredData?.articles || !Array.isArray(structuredData.articles)) {
        console.error("Invalid response from XAI:", xaiResponse);
        return NextResponse.json(
          { error: "Failed to generate structured news content" },
          { status: 500 }
        );
      }

      // Process articles
      const processedArticles = structuredData.articles
        .slice(0, count)
        .map(article => ({
          headline: article.headline || "Untitled",
          summary: article.summary || "No summary available",
          section: article.section || section,
          timestamp: article.timestamp || new Date().toISOString(),
        }));

      // Ensure we have at least one article
      if (processedArticles.length === 0) {
        return NextResponse.json(
          { error: "No articles were generated" },
          { status: 500 }
        );
      }

      return NextResponse.json({ articles: processedArticles });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Invalid request parameters", details: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
