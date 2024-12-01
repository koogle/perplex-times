"use client"

import { useEffect, useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { ArticleTile } from "@/components/article-tile"
import { useNewsStore } from "@/store/newsStore"
import { useNewsGeneration } from "@/hooks/useNewsGeneration"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { TopicBar } from "@/components/TopicBar"

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const {
    articles,
    savedArticles,
    selectedSection,
    saveArticle,
    removeArticle,
    articleCount
  } = useNewsStore()
  
  const { generateNews, cancelGeneration, isGenerating } = useNewsGeneration()

  // Load news when section changes
  useEffect(() => {
    const loadNews = async () => {
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

    // Cleanup function to cancel any ongoing generation when section changes
    return () => {
      cancelGeneration()
      setError(null)
    }
  }, [selectedSection, articleCount])

  const filteredArticles = articles.filter(
    article => article.section === selectedSection
  )

  const savedArticleIds = savedArticles.map(article => article.id)

  const savedArticlesInSection = savedArticles.filter(
    article => article.section === selectedSection
  )

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <TopicBar />
      <main className="container py-6">
        {error ? (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : isLoading && !isGenerating ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Current Articles */}
            {filteredArticles.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Latest Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArticles.map((article) => (
                    <ArticleTile
                      key={article.id}
                      article={article}
                      isSaved={savedArticleIds.includes(article.id)}
                      onSave={() => saveArticle(article)}
                      onRemove={() => removeArticle(article.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Saved Articles */}
            {savedArticlesInSection.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Saved Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedArticlesInSection.map((article) => (
                    <ArticleTile
                      key={article.id}
                      article={article}
                      isSaved={true}
                      onSave={() => {}}
                      onRemove={() => removeArticle(article.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {!isLoading && filteredArticles.length === 0 && savedArticlesInSection.length === 0 && (
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
