import { NextRequest, NextResponse } from "next/server";
import { generateObject, Message } from "ai";
import { articleSchema, headlineSchema, trendingSchema } from "@/lib/schema";

const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

// Custom provider for Perplexity AI
const perplexity = {
  id: "perplexity",
  generateText: async ({ messages }: { messages: Message[] }) => {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-instruct",
        messages,
        temperature: 0.2,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to generate content");
    }

    const data = await response.json();
    return data.choices[0].message.content;
  },
};

const systemMessages: Record<string, string> = {
  article:
    "You are an AI news article generator. Create a detailed, factual article.",
  headline:
    "You are a headline generator. Create a concise, engaging headline.",
  trending:
    "Generate a list of current trending news topics with descriptions.",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: "Invalid request: messages array is required" },
        { status: 400 }
      );
    }

    const { messages, type = "article" } = body;

    if (!["article", "headline", "trending"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type: must be 'article', 'headline', or 'trending'" },
        { status: 400 }
      );
    }

    if (!process.env.PERPLEXITY_API_KEY) {
      return NextResponse.json(
        {
          error:
            "Perplexity API key is not configured. Please add PERPLEXITY_API_KEY to your .env.local file.",
        },
        { status: 401 }
      );
    }

    // Select the appropriate schema based on type
    const schemaMap = {
      article: articleSchema,
      headline: headlineSchema,
      trending: trendingSchema,
    };
    const schema = schemaMap[type as keyof typeof schemaMap];

    const { object } = await generateObject({
      model: perplexity,
      schema,
      schemaName: type.charAt(0).toUpperCase() + type.slice(1),
      schemaDescription: `A ${type} generation request`,
      mode: "json",
      prompt: messages[messages.length - 1].content,
      systemPrompt: systemMessages[type],
    });

    return NextResponse.json(object);
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
