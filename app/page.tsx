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
  const [headlines, setHeadlines] = useState<string[]>([])
  
  const {
    articles,
    savedArticles,
    selectedSection,
    addArticle,
    saveArticle,
    removeArticle,
  } = useNewsStore()
  
  const { generateHeadlines, generateArticle, cancelGeneration } = useNewsGeneration()

  // Load headlines when section changes
  useEffect(() => {
    const loadHeadlines = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const newHeadlines = await generateHeadlines(selectedSection)
        setHeadlines(newHeadlines)
      } catch (error: any) {
        setError(error?.message || 'Failed to load headlines. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadHeadlines()

    // Cleanup function to cancel any ongoing generation when section changes
    return () => {
      cancelGeneration()
      setHeadlines([])
      setError(null)
    }
  }, [selectedSection])

  const handleHeadlineClick = async (headline: string) => {
    try {
      const article = await generateArticle(headline, selectedSection)
      if (article) {
        setHeadlines(prev => prev.filter(h => h !== headline))
      }
    } catch (error: any) {
      setError(error?.message || 'Failed to generate article. Please try again.')
    }
  }

  const filteredArticles = articles.filter(
    article => article.section === selectedSection
  )

  const savedArticleIds = savedArticles.map(article => article.id)

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
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {headlines.length > 0 && (
              <div className="grid grid-cols-1 gap-4">
                {headlines.map((headline, index) => (
                  <button
                    key={index}
                    onClick={() => handleHeadlineClick(headline)}
                    className="w-full text-left p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
                  >
                    <h3 className="text-lg font-semibold">{headline}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Click to read full article</p>
                  </button>
                ))}
              </div>
            )}
            {filteredArticles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article, index) => (
                  <ArticleTile
                    key={article.id}
                    article={article}
                    index={index}
                    onSave={saveArticle}
                    onRemove={() => removeArticle(article.id)}
                    saved={savedArticleIds.includes(article.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
