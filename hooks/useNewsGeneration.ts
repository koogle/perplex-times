import { useState } from "react";
import { Article, useNewsStore } from "@/store/newsStore";
import { Cache } from "@/utils/cache";

interface HeadlinesResponse {
  headlines: string[];
}

interface ArticleResponse {
  text: string;
}

interface KeywordsResponse {
  keywords: string[];
}

const generateContent = async <T>(
  type: string,
  messages: Array<{ role: string; content: string }>,
  signal?: AbortSignal
): Promise<T> => {
  const response = await fetch("/api/news", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages,
      type,
    }),
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to generate content");
  }

  return response.json() as Promise<T>;
};

export function useNewsGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const { addArticle } = useNewsStore();

  const cancelGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsGenerating(false);
    }
  };

  const generateHeadlines = async (section: string, minCount: number = 5) => {
    setError(null);
    // Cancel any ongoing generation
    cancelGeneration();
    
    // Create new abort controller
    const controller = new AbortController();
    setAbortController(controller);

    try {
      let headlines: string[] = [];
      let attempts = 0;
      const maxAttempts = 3;

      while (headlines.length < minCount && attempts < maxAttempts) {
        const response = await generateContent<HeadlinesResponse>(
          section === "Breaking News" ? "breaking" : "headlines",
          [
            {
              role: "user",
              content: section === "Breaking News"
                ? "Generate the most important news headlines from the last 24 hours"
                : `Generate current news headlines for the ${section} section`,
            },
          ],
          controller.signal
        );
        
        headlines = [...new Set([...headlines, ...response.headlines])];
        attempts++;
      }

      setAbortController(null);
      return headlines;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return []; // Return empty array if aborted
      }
      console.error("Error generating headlines:", error);
      setError(error.message || "Failed to generate headlines");
      throw error;
    }
  };

  const generateArticle = async (headline: string, section: string) => {
    setIsGenerating(true);
    setError(null);
    
    // Cancel any ongoing generation
    cancelGeneration();
    
    // Create new abort controller
    const controller = new AbortController();
    setAbortController(controller);

    try {
      // Check cache first
      const cacheKey = `article-${headline}`;
      const cachedArticle: Article | null = Cache.get(cacheKey);

      if (cachedArticle) {
        addArticle(cachedArticle);
        return cachedArticle;
      }

      // Generate the full article
      const articleResponse = await generateContent<ArticleResponse>(
        "article",
        [{ role: "user", content: `Write a comprehensive news article for the headline: ${headline}` }],
        controller.signal
      );

      // Generate keywords from the article
      const keywordsResponse = await generateContent<KeywordsResponse>(
        "keywords",
        [{ role: "user", content: `Extract keywords from this article: ${articleResponse.text}` }],
        controller.signal
      );

      const article = {
        id: Date.now().toString(),
        headline: headline.trim(),
        content: articleResponse.text.trim(),
        summary: articleResponse.text.split(".").slice(0, 2).join(".").trim() + ".",
        keywords: keywordsResponse.keywords,
        section,
        publishedAt: new Date().toISOString(),
        sources: [],
        citations: [],
        timestamp: Date.now(),
      };

      // Cache the article
      Cache.set(cacheKey, article);
      addArticle(article);

      setAbortController(null);
      return article;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return null; // Return null if aborted
      }
      console.error("Error generating article:", error);
      setError(error.message || "Failed to generate article");
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTrendingTopics = async () => {
    setError(null);
    try {
      const headlines = await generateHeadlines("Breaking News", 5);
      return headlines.map(headline => ({
        title: headline,
        description: "", // We could generate descriptions if needed
      }));
    } catch (error: any) {
      console.error("Error generating trending topics:", error);
      setError(error.message || "Failed to generate trending topics");
      throw error;
    }
  };

  return {
    generateHeadlines,
    generateArticle,
    generateTrendingTopics,
    isGenerating,
    error,
    cancelGeneration,
  };
}
