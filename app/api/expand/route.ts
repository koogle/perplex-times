import { streamText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export async function POST(req: Request) {
  try {
    const { headline } = await req.json();

    const perplexity = createOpenAICompatible({
      baseURL: "https://api.perplexity.ai/",
      headers: {
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      },
    });

    const result = streamText({
      model: perplexity("llama-3.1-sonar-large-128k-online"),
      system:
        "You are a news researcher. Provide a detailed, well-structured article about the given headline. Include:\n" +
        "1. A comprehensive overview of the news\n" +
        "2. Key background information and context\n" +
        "3. Analysis of implications and potential future impact\n" +
        "Format the response in clear sections with appropriate spacing.",
      prompt: `Write a detailed article about: "${headline}"`,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in expand route:", error);
    return new Response(JSON.stringify({ error: "Failed to expand article" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
