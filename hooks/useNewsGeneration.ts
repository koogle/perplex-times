import { useState } from "react";
import { Article, useNewsStore } from "@/store/newsStore";
import { Cache } from "@/utils/cache";
import { NewsItem, NewsResponse } from "@/types/news";

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

  const generateNews = async (type: string, section?: string) => {
    setError(null);
    // Cancel any ongoing generation
    cancelGeneration();
    
    // Create new abort controller
    const controller = new AbortController();
    setAbortController(controller);

    try {
      let newsItems: NewsItem[] = [];
      let attempts = 0;
      const maxAttempts = 3;

      while (newsItems.length < 5 && attempts < maxAttempts) {
        const response = await fetch("/api/news", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type,
            section,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || `HTTP error! status: ${response.status}`);
        }

        const data: NewsResponse = await response.json();
        newsItems = [...new Set([...newsItems, ...data.articles])];
        attempts++;
      }

      // Convert NewsItems to Articles and cache them
      const articles = newsItems.map((item): Article => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        headline: item.headline,
        content: item.summary,
        summary: item.summary,
        keywords: [],
        section: item.section || section || 'Breaking News',
        publishedAt: item.timestamp,
        timestamp: Date.now(),
      }));

      // Cache and add articles
      articles.forEach(article => {
        const cacheKey = `article-${article.headline}`;
        Cache.set(cacheKey, article);
        addArticle(article);
      });

      setAbortController(null);
      return articles;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return []; // Return empty array if aborted
      }
      const errorMessage = error.message || "Failed to generate news";
      console.error("Error generating news:", errorMessage);
      setError(errorMessage);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateNews,
    isGenerating,
    error,
    cancelGeneration,
  };
}
