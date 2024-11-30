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

const generateContent = async <T>(type: string, messages: Array<{ role: string; content: string }>) => {
  const response = await fetch("/api/news", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages,
      type,
    }),
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
  const { addArticle } = useNewsStore();

  const generateHeadlines = async (section: string) => {
    setError(null);
    try {
      const response = await generateContent<HeadlinesResponse>("headlines", [
        { role: "user", content: `Generate current news headlines for the ${section} section` },
      ]);
      return response.headlines;
    } catch (error: any) {
      console.error("Error generating headlines:", error);
      setError(error.message || "Failed to generate headlines");
      throw error;
    }
  };

  const generateArticle = async (headline: string, section: string) => {
    setIsGenerating(true);
    setError(null);

    try {
      // Check cache first
      const cacheKey = `article-${headline}`;
      const cachedArticle: Article | null = Cache.get(cacheKey);

      if (cachedArticle) {
        addArticle(cachedArticle);
        return cachedArticle;
      }

      // Generate the full article
      const articleResponse = await generateContent<ArticleResponse>("article", [
        { role: "user", content: `Write a comprehensive news article for the headline: ${headline}` },
      ]);

      // Generate keywords from the article
      const keywordsResponse = await generateContent<KeywordsResponse>("keywords", [
        { role: "user", content: `Extract keywords from this article: ${articleResponse.text}` },
      ]);

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

      return article;
    } catch (error: any) {
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
      const response = await generateContent<HeadlinesResponse>("headlines", [
        { role: "user", content: "Generate current trending news headlines across all sections" },
      ]);
      return response.headlines.map(headline => ({
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
  };
}
