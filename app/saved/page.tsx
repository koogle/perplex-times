"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { ArticleTile } from "@/components/article-tile";
import { Article, useNewsStore } from "@/store/newsStore";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils/time";
import { motion } from "framer-motion";

export default function SavedArticles() {
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [expandedArticle, setExpandedArticle] = useState<Article | null>(null);
  const { savedArticles } = useNewsStore();

  // Sort articles by timestamp, newest first
  const sortedArticles = [...savedArticles].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleExpandArticle = async (article: Article) => {
    setExpandedArticle({
      ...article,
      isExpanding: true,
      longFormContent: "",
    });

    // Check if we already have expanded content
    const existingContent =
      useNewsStore.getState().expandedArticles[article.id];
    if (existingContent) {
      setExpandedArticle({
        ...article,
        isExpanding: false,
        longFormContent: existingContent.longFormContent,
        additionalContext: existingContent.additionalContext,
        implications: existingContent.implications,
      });
      return;
    }

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

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No reader available");
      }

      let accumulatedContent = "";
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        const text = decoder.decode(value);
        accumulatedContent += text;

        setExpandedArticle(prev => ({
          ...prev!,
          longFormContent: accumulatedContent,
        }));
      }

      // Store the expanded content
      useNewsStore.getState().setExpandedArticle(article.id, {
        longFormContent: accumulatedContent,
        additionalContext: "",  // You might want to parse the content to separate these sections
        implications: "",
      });

      setExpandedArticle(prev => ({
        ...prev!,
        isExpanding: false,
      }));

    } catch (error) {
      console.error("Error expanding article:", error);
      setExpandedArticle(prev => ({
        ...prev!,
        isExpanding: false,
        error: "Failed to expand article",
      }));
    }
  };

  return (
    <div className="relative min-h-screen">
      <SiteHeader />

      <div className="container flex gap-6 py-6">
        {/* Saved Articles Drawer */}
        <div className="w-80 shrink-0 border-r pr-6">
          <h2 className="mb-4 text-lg font-medium">Saved Articles</h2>
          <div className="space-y-4">
            {sortedArticles.length === 0 ? (
              <p className="text-sm text-muted-foreground">No saved articles</p>
            ) : (
              sortedArticles.map((article) => (
                <button
                  key={article.id}
                  onClick={() => {
                    setSelectedArticle(article.id);
                    handleExpandArticle(article);
                  }}
                  className={cn(
                    "w-full text-left",
                    "border p-3 hover:bg-gray-50",
                    selectedArticle === article.id && "bg-gray-50"
                  )}
                >
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {formatTime(new Date(article.timestamp).getTime())}
                    </p>
                    <p className="line-clamp-2 text-sm font-medium">
                      {article.headline}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Article Content */}
        <div className="flex-1">
          {expandedArticle ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ArticleTile
                article={expandedArticle}
                expanded={true}
                onClose={() => {
                  setExpandedArticle(null);
                  setSelectedArticle(null);
                }}
                index={0}
              />
            </motion.div>
          ) : (
            <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
              Select an article to read
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
