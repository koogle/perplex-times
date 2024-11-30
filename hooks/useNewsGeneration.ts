import { useState } from "react";
import { Article, useNewsStore } from "@/store/newsStore";
import { Cache } from "@/utils/cache";

interface HeadlinesResponse {
  headlines: string[];
  error?: string;
}

interface ArticleResponse {
  text: string;
  error?: string;
}

interface KeywordsResponse {
  keywords: string[];
  error?: string;
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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Failed to generate content (${response.status})`);
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data as T;
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
      setError(null);
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
      const errorMessage = error.message || "Failed to generate headlines";
      console.error("Error generating headlines:", errorMessage);
      setError(errorMessage);
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
      const errorMessage = error.message || "Failed to generate article";
      console.error("Error generating article:", errorMessage);
      setError(errorMessage);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateHeadlines,
    generateArticle,
    isGenerating,
    error,
    cancelGeneration,
  };
}
