import { StreamingTextResponse, LangChainStream, Message } from 'ai';
import { experimental_StreamingReactResponse } from 'ai/react';
import { NextRequest } from 'next/server';

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

export async function POST(req: NextRequest) {
  const { messages, type = 'article' } = await req.json();

  const systemMessages: Record<string, string> = {
    article: "You are an AI news article generator. Create detailed, factual articles with citations. Format: [CONTENT] followed by [KEYWORDS] as a comma-separated list.",
    headline: "You are a headline generator for a news website. Create compelling, concise headlines.",
    trending: "Generate a list of current trending news topics. Format the response as a numbered list."
  };

  const { stream, handlers } = LangChainStream();

  const response = fetch(PERPLEXITY_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "llama-3.1-sonar-small-128k-online",
      messages: [
        { role: 'system', content: systemMessages[type] },
        ...messages
      ],
      temperature: 0.2,
      top_p: 0.9,
      stream: true,
      search_recency_filter: type === 'trending' ? 'day' : 'week'
    }),
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(await response.text());
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No reader available');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          handlers.onToken(data.choices[0].delta.content || '');
        }
      }
    }

    handlers.onComplete();
  });

  return new StreamingTextResponse(stream);
}
