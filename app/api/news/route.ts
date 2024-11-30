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
  breaking:
    "You are a senior news editor at a major publication. Generate 5 of the most important and impactful news headlines from the last 24 hours globally. Focus on major developments, breaking news, and stories with significant impact. Format as a numbered list. Each headline should be different and cover distinct events.",
  headlines:
    "You are an experienced news editor at a major publication. Generate 5 unique and diverse news headlines for the specified section. Each headline should cover a different topic or angle. Format each as a numbered list. Make the headlines catchy but informative, similar to what you'd see in quality news publications. Ensure each headline is distinct and not redundant with others in the list.",
  article:
    "You are a professional journalist writing for a major news publication. Write a comprehensive, well-researched article that maintains journalistic integrity and objectivity. Include relevant details, quotes if applicable, and maintain a professional tone throughout.",
  keywords:
    "You are a content strategist. Analyze the provided article and extract 5-7 relevant keywords or key phrases that best represent its main topics and themes. Format as a comma-separated list.",
};

// Keep track of generated headlines to avoid duplicates
const recentHeadlines = new Set<string>();
const MAX_RECENT_HEADLINES = 100;

// Function to clean and normalize headlines for comparison
const normalizeHeadline = (headline: string): string => {
  return headline.toLowerCase().trim().replace(/[^\w\s]/g, '');
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

    if (!["breaking", "headlines", "article", "keywords"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type: must be 'breaking', 'headlines', 'article', or 'keywords'" },
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

    if (type === "breaking" || type === "headlines") {
      // Parse the numbered list into an array of headlines
      let headlines = text
        .split("\n")
        .filter(line => /^\d+\./.test(line))
        .map(line => line.replace(/^\d+\.\s*/, "").trim());

      // Filter out duplicates using the normalized comparison
      headlines = headlines.filter(headline => {
        const normalized = normalizeHeadline(headline);
        if (recentHeadlines.has(normalized)) {
          return false;
        }
        recentHeadlines.add(normalized);
        
        // Keep the set size manageable
        if (recentHeadlines.size > MAX_RECENT_HEADLINES) {
          const toRemove = Array.from(recentHeadlines)[0];
          recentHeadlines.delete(toRemove);
        }
        
        return true;
      });

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
