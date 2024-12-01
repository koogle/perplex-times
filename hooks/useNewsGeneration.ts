import { useState, useRef } from "react";
import { useNewsStore } from "@/store/newsStore";

export function useNewsGeneration() {
  const [isGenerating, setIsGenerating] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const addArticles = useNewsStore((state) => state.addArticles)

  const generateNews = async (
    type: "breaking" | "section",
    section: string,
    count: number
  ) => {
    if (isGenerating) {
      return
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    setIsGenerating(true)
    abortControllerRef.current = new AbortController()

    try {
      // Create timestamp at the start of the request
      const timestamp = Date.now()
      
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
      })

      if (!response.ok) {
        throw new Error("Failed to generate news")
      }

      const articles = await response.json()
      
      // Ensure articles is an array before adding to store
      const articlesArray = Array.isArray(articles) ? articles : 
        articles?.articles ? articles.articles : [];
      
      // Add timestamps and IDs to articles using the timestamp from request start
      const processedArticles = articlesArray.map(article => ({
        ...article,
        id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp,
        section
      }));
        
      addArticles(processedArticles, section)
    } catch (error) {
      // Don't throw error if request was aborted
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      throw error;
    } finally {
      setIsGenerating(false)
      abortControllerRef.current = null
    }
  }

  const cancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsGenerating(false)
    }
  }

  return {
    generateNews,
    cancelGeneration,
    isGenerating,
  }
}
