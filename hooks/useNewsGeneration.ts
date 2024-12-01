import { useState } from "react";
import { Article, useNewsStore } from "@/store/newsStore";
import { Cache } from "@/utils/cache";
import { NewsItem, NewsResponse } from "@/types/news";

export function useNewsGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const { addArticle } = useNewsStore();

  const cancelGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsGenerating(false);
      setProgress(0);
      setError(null);
    }
  };

  const generateSingleArticle = async (
    type: string,
    section: string,
    signal: AbortSignal
  ): Promise<Article | null> => {
    try {
      const response = await fetch("/api/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          section,
          count: 1, // Request only one article
        }),
        signal,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      const data: NewsResponse = await response.json();
      
      if (!data.articles || data.articles.length === 0) {
        return null;
      }

      const item = data.articles[0];
      const article: Article = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        headline: item.headline,
        content: item.summary,
        summary: item.summary,
        keywords: [],
        section: item.section || section,
        publishedAt: item.timestamp,
        timestamp: Date.now(),
      };

      const cacheKey = `article-${article.headline}`;
      Cache.set(cacheKey, article);
      addArticle(article);

      return article;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return null;
      }
      throw error;
    }
  };

  const generateNews = async (
    type: string,
    section: string,
    count: number = 5
  ) => {
    setError(null);
    setProgress(0);
    cancelGeneration();
    
    const controller = new AbortController();
    setAbortController(controller);
    setIsGenerating(true);

    try {
      // Create array of promises for parallel execution
      const promises = Array(count).fill(null).map(() => 
        generateSingleArticle(type, section, controller.signal)
      );

      // Execute all promises in parallel with progress tracking
      let completed = 0;
      const results = await Promise.allSettled(promises);
      
      results.forEach((result) => {
        completed++;
        setProgress((completed / count) * 100);
        
        if (result.status === 'rejected') {
          console.error('Article generation failed:', result.reason);
        }
      });

      // Filter out failed generations and null results
      const articles = results
        .filter((result): result is PromiseFulfilledResult<Article | null> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value)
        .filter((article): article is Article => article !== null);

      return articles;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return [];
      }
      const errorMessage = error.message || "Failed to generate news";
      console.error("Error generating news:", errorMessage);
      setError(errorMessage);
      throw error;
    } finally {
      setIsGenerating(false);
      setProgress(0);
      setAbortController(null);
    }
  };

  return {
    generateNews,
    isGenerating,
    progress,
    error,
    cancelGeneration,
  };
}
