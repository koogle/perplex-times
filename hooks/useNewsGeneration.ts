import { useState, useRef } from "react";
import { useNewsStore } from "@/store/newsStore";

export function useNewsGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const addArticles = useNewsStore((state) => state.addArticles);

  const generateNews = async (
    type: "breaking" | "section",
    section: string,
    count: number
  ) => {
    if (isGenerating) {
      return;
    }

    setIsGenerating(true);
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          section,
          count,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to generate news");
      }

      const articles = await response.json();
      
      // Ensure articles is an array before adding to store
      const articlesArray = Array.isArray(articles) ? articles : 
        articles?.articles ? articles.articles : [];
      
      // Add timestamps and IDs to articles
      const timestamp = Date.now();
      const processedArticles = articlesArray.map(article => ({
        ...article,
        id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp,
        section
      }));
        
      addArticles(processedArticles, section);
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const cancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  return {
    generateNews,
    cancelGeneration,
    isGenerating,
  };
}
