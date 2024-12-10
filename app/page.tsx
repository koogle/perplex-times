"use client";

import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { ArticleTile } from "@/components/article-tile";
import { Article, useNewsStore } from "@/store/newsStore";
import { useNewsGeneration } from "@/hooks/useNewsGeneration";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { TopicBar } from "@/components/TopicBar";
import { formatTime } from "@/lib/utils/time";
import { cn } from "@/lib/utils/cn";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

export default function Home() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedArticle, setExpandedArticle] = useState<Article | null>(null);

  const {
    selectedSection,
    articleCount,
    getArticlesForSection,
    getSectionLastUpdated,
    needsUpdate,
    setLastFetchAttempt,
  } = useNewsStore();

  const { generateNews, cancelGeneration } = useNewsGeneration();

  const articles = getArticlesForSection(selectedSection);
  const lastUpdated = getSectionLastUpdated(selectedSection);

  // Reset expanded article when section changes
  useEffect(() => {
    setExpandedArticle(null);
  }, [selectedSection]);

  // Load news when section changes or when needed
  useEffect(() => {
    let mounted = true;

    const loadNews = async () => {
      // Track fetch attempt
      setLastFetchAttempt(selectedSection);
      setIsLoading(true);
      setError(null);

      // Load from localStorage first
      const cachedNews = localStorage.getItem(`news_${selectedSection}`);
      if (cachedNews) {
        const parsedNews = JSON.parse(cachedNews);
        if (mounted) {
          useNewsStore.getState().setArticles(selectedSection, parsedNews);
        }
      }

      try {
        await generateNews(
          selectedSection === "Breaking News" ? "breaking" : "section",
          selectedSection,
          articleCount
        );

        // Cache the fresh data
        const freshArticles = getArticlesForSection(selectedSection);
        localStorage.setItem(
          `news_${selectedSection}`,
          JSON.stringify(freshArticles)
        );
      } catch (error: Error | unknown) {
        if (mounted && (error as Error)?.name !== "AbortError") {
          setError(
            (error as Error)?.message ||
              "Failed to load news. Please try again."
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Check if we need to load news
    if (needsUpdate(selectedSection)) {
      loadNews();
    } else {
      setIsLoading(false);
    }

    return () => {
      mounted = false;
      cancelGeneration();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSection, articleCount]);

  const handleExpandArticle = async (article: Article) => {
    // If article is already expanded, just collapse it
    if (expandedArticle?.id === article.id) {
      setExpandedArticle(null);
      return;
    }

    // First set the expanded article with loading state
    setExpandedArticle({
      ...article,
      isExpanding: true,
    });

    // Reset streaming content
    useNewsStore.getState().setStreamingContent(article.id, '');

    try {
      const response = await fetch("/api/expand", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ headline: article.headline }),
      });

      if (!response.ok) {
        throw new Error("Failed to expand article");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        useNewsStore.getState().appendStreamingContent(article.id, text);
      }

      // Update the expanded article state when streaming is complete
      setExpandedArticle((current) => 
        current?.id === article.id 
          ? { ...article, isExpanding: false }
          : current
      );

    } catch (error) {
      console.error("Error expanding article:", error);
      // Only clear expanded state if this is still the current article
      setExpandedArticle((current) => 
        current?.id === article.id ? null : current
      );
      setError("Failed to expand article. Please try again.");
    }
  };

  // Filter saved articles for current section
  const savedArticles = useNewsStore((state) => state.savedArticles);
  const savedArticlesInSection = savedArticles.filter(
    (article) => article.section === selectedSection
  );

  return (
    <div className="relative min-h-screen">
      <main className="container mx-auto p-4 space-y-8">
        <SiteHeader />
        <TopicBar />

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <LayoutGroup>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {articles.map((article, index) => (
                <ArticleTile
                  key={article.id}
                  article={article}
                  index={index}
                  expanded={expandedArticle?.id === article.id}
                  onClick={() => {
                    if (expandedArticle?.id === article.id) {
                      setExpandedArticle(null);
                    } else {
                      handleExpandArticle(article);
                    }
                  }}
                  onClose={() => setExpandedArticle(null)}
                />
              ))}
            </AnimatePresence>
          </div>
        </LayoutGroup>

        {isLoading && (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
      </main>
    </div>
  );
}
