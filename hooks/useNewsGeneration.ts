import { useState } from "react";
import { Article, useNewsStore } from "@/store/newsStore";
import { Cache } from "@/utils/cache";
import { JSONParseError, TypeValidationError } from "ai";
import { z } from "zod";

interface GenerationError {
  type: "parse-error" | "validation-error" | "unknown-error";
  message: string;
}

const generateContent = async <T>(type: string, messages: Array<{ role: string; content: string }>) => {
  try {
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
  } catch (error) {
    if (JSONParseError.isJSONParseError(error)) {
      throw { type: "parse-error", message: `Invalid JSON response: ${error.text}` };
    } else if (TypeValidationError.isTypeValidationError(error)) {
      throw { type: "validation-error", message: `Invalid data structure: ${JSON.stringify(error.value)}` };
    } else {
      throw { type: "unknown-error", message: error instanceof Error ? error.message : "An unknown error occurred" };
    }
  }
};

export function useNewsGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<GenerationError | null>(null);
  const { addArticle } = useNewsStore();

  const generateArticle = async (topic: string) => {
    setIsGenerating(true);
    setError(null);

    try {
      // Check cache first
      const cacheKey = `article-${topic}`;
      const cachedArticle: Article | null = Cache.get(cacheKey);

      if (cachedArticle) {
        addArticle(cachedArticle);
        return cachedArticle;
      }

      // Generate headline first
      const headlineResponse = await generateContent<{ headline: string }>("headline", [
        { role: "user", content: `Generate a headline about: ${topic}` },
      ]);

      // Generate full article
      const articleResponse = await generateContent<{ content: string; keywords: string[] }>("article", [
        { role: "user", content: `Write a comprehensive news article for the headline: ${headlineResponse.headline}` },
      ]);

      const article = {
        id: Date.now().toString(),
        headline: headlineResponse.headline.trim(),
        content: articleResponse.content.trim(),
        summary: articleResponse.content.split(".").slice(0, 2).join(".") + ".",
        keywords: articleResponse.keywords,
        section: topic,
        publishedAt: new Date().toISOString(),
        sources: [],
        citations: [],
        timestamp: Date.now(),
      };

      // Cache the article
      Cache.set(cacheKey, article);
      addArticle(article);

      return article;
    } catch (error) {
      console.error("Error generating article:", error);
      setError(error as GenerationError);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTrendingTopics = async () => {
    setError(null);
    try {
      const response = await generateContent<{
        topics: Array<{ title: string; description: string }>;
      }>("trending", [{ role: "user", content: "Generate trending news topics" }]);
      return response.topics;
    } catch (error) {
      console.error("Error generating trending topics:", error);
      setError(error as GenerationError);
      throw error;
    }
  };

  return {
    generateArticle,
    generateTrendingTopics,
    isGenerating,
    error,
  };
}
