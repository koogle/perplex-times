import { NextRequest, NextResponse } from "next/server";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";

const perplexity = createOpenAICompatible({
  name: "perplexity",
  baseURL: "https://api.perplexity.ai",
  headers: {
    Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
  },
});

const systemMessages: Record<string, string> = {
  headlines:
    "You are an experienced news editor at a major publication. Generate 5 current and engaging news headlines for the specified section. Format each as a numbered list. Make the headlines catchy but informative, similar to what you'd see in quality news publications.",
  article:
    "You are a professional journalist writing for a major news publication. Write a comprehensive, well-researched article that maintains journalistic integrity and objectivity. Include relevant details, quotes if applicable, and maintain a professional tone throughout.",
  keywords:
    "You are a content strategist. Analyze the provided article and extract 5-7 relevant keywords or key phrases that best represent its main topics and themes. Format as a comma-separated list.",
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

    if (!["headlines", "article", "keywords"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type: must be 'headlines', 'article', or 'keywords'" },
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

    const { text } = await generateText({
      model: perplexity.chatModel("llama-3.1-sonar-large-128k-online"),
      messages: [
        { role: "system", content: systemMessages[type] },
        ...messages,
      ],
    });

    if (type === "headlines") {
      // Parse the numbered list into an array of headlines
      const headlines = text
        .split("\n")
        .filter(line => /^\d+\./.test(line))
        .map(line => line.replace(/^\d+\.\s*/, "").trim());

      return NextResponse.json({ headlines });
    }

    if (type === "keywords") {
      // Parse the comma-separated list into an array of keywords
      const keywords = text
        .split(",")
        .map(keyword => keyword.trim())
        .filter(Boolean);

      return NextResponse.json({ keywords });
    }

    // For article, return the raw text
    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
