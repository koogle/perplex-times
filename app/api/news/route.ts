import { NextResponse } from "next/server";
import { Perplexity } from "@/lib/perplexity";

const perplexity = new Perplexity();

const normalizeHeadlines = (headlines: string[]): string[] => {
  return headlines
    .map(headline => headline.trim())
    .filter(headline => headline.length > 0)
    .map(headline => {
      // Remove numbering if present
      return headline.replace(/^\d+\.\s*/, '');
    })
    .filter((headline, index, self) => 
      // Remove duplicates, case-insensitive
      index === self.findIndex(h => h.toLowerCase() === headline.toLowerCase())
    );
};

export async function POST(req: Request) {
  try {
    // Validate API key
    if (!process.env.PERPLEXITY_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured. Please set PERPLEXITY_API_KEY environment variable." },
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

    const { messages, type } = body;

    // Validate required fields
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Missing or invalid 'messages' field. Expected an array." },
        { status: 400 }
      );
    }

    if (!type || typeof type !== 'string') {
      return NextResponse.json(
        { error: "Missing or invalid 'type' field. Expected a string." },
        { status: 400 }
      );
    }

    // Process request based on type
    try {
      switch (type) {
        case "breaking": {
          const prompt = `You are a professional news editor. Generate 5 of the most important breaking news headlines from the last 24 hours.
          Format each headline on a new line. Keep headlines concise but informative. Do not include numbers or bullet points.
          Focus on major global events, significant developments, and high-impact stories.`;
          
          const response = await perplexity.completion({
            messages: [{ role: "user", content: prompt }]
          });

          const headlines = response.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

          return NextResponse.json({ headlines: normalizeHeadlines(headlines) });
        }

        case "headlines": {
          const response = await perplexity.completion({
            messages
          });

          const headlines = response.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

          return NextResponse.json({ headlines: normalizeHeadlines(headlines) });
        }

        case "article": {
          const headline = messages[0].content.replace('Write a comprehensive news article for the headline: ', '');
          const prompt = `You are a professional news journalist. Write a comprehensive news article for the following headline. 
          Include relevant details, quotes if applicable, and maintain a neutral, journalistic tone.
          Format the article in clear paragraphs. Keep it concise but informative.
          Headline: ${headline}`;

          const response = await perplexity.completion({
            messages: [{ role: "user", content: prompt }]
          });

          return NextResponse.json({ text: response });
        }

        case "keywords": {
          const prompt = `Extract 3-5 most relevant keywords or key phrases from this article. 
          Return only the keywords, one per line:
          ${messages[0].content.replace('Extract keywords from this article: ', '')}`;

          const response = await perplexity.completion({
            messages: [{ role: "user", content: prompt }]
          });

          const keywords = response.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

          return NextResponse.json({ keywords });
        }

        default:
          return NextResponse.json(
            { error: "Invalid type. Must be one of: breaking, headlines, article, keywords" },
            { status: 400 }
          );
      }
    } catch (error) {
      console.error("Perplexity API Error:", error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to generate content" },
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
