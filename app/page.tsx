"use client"

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { ArticleTile } from "@/components/article-tile"
import { useNewsStore } from "@/store/newsStore"
import { useNewsGeneration } from "@/hooks/useNewsGeneration"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { TopicBar } from "@/components/TopicBar"
import { formatTime } from "@/lib/utils/time"

export default function Home() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    selectedSection,
    saveArticle,
    removeArticle,
    articleCount,
    getArticlesForSection,
    getSectionLastUpdated,
    needsUpdate
  } = useNewsStore()
  
  const { generateNews, cancelGeneration } = useNewsGeneration()

  const articles = getArticlesForSection(selectedSection)
  const lastUpdated = getSectionLastUpdated(selectedSection)

  // Load news when section changes or when needed
  useEffect(() => {
    const loadNews = async () => {
      if (!needsUpdate(selectedSection)) {
        return;
      }

      setIsLoading(true)
      setError(null)
      try {
        await generateNews(
          selectedSection === "Breaking News" ? "breaking" : "section",
          selectedSection,
          articleCount
        )
      } catch (error: any) {
        setError(error?.message || 'Failed to load news. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadNews()

    return () => {
      cancelGeneration()
      setError(null)
    }
  }, [selectedSection, articleCount])

  // Filter saved articles for current section
  const savedArticles = useNewsStore((state) => state.savedArticles)
  const savedArticlesInSection = savedArticles.filter(
    (article) => article.section === selectedSection
  )

  // Filter out saved articles from current articles
  const filteredArticles = Array.isArray(articles) ? articles.filter(
    (article) => !savedArticles.some((saved) => saved.id === article.id)
  ) : []

  return (
    <div className="relative min-h-screen">
      <SiteHeader />
      <TopicBar />

      <main className="container py-6">
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {lastUpdated > 0 && `Last updated: ${formatTime(lastUpdated)}`}
              </div>
              {isLoading && (
                <div className="text-sm text-muted-foreground animate-pulse">
                  Generating news...
                </div>
              )}
            </div>
            
            {/* Current Articles */}
            {(filteredArticles.length > 0 || isLoading) && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">Latest News</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {isLoading ? (
                    // Loading placeholders
                    Array.from({ length: articleCount }).map((_, index) => (
                      <div 
                        key={index} 
                        className="aspect-square bg-muted animate-pulse rounded-none border border-black p-4"
                      >
                        <div className="h-4 w-1/3 bg-muted-foreground/20 mb-4"></div>
                        <div className="h-6 w-3/4 bg-muted-foreground/20"></div>
                      </div>
                    ))
                  ) : (
                    filteredArticles.map((article) => (
                      <ArticleTile
                        key={article.id}
                        article={article}
                        onSave={() => saveArticle(article)}
                        index={0}
                      />
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Saved Articles */}
            {savedArticlesInSection.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">Saved Articles</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {savedArticlesInSection.map((article) => (
                    <ArticleTile
                      key={article.id}
                      article={article}
                      saved
                      onRemove={() => removeArticle(article.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {filteredArticles.length === 0 && savedArticlesInSection.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No articles found. New articles will appear here.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
