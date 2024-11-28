"use client"

import { useEffect, useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { ArticleTile } from "@/components/article-tile"
import { useNewsStore } from "@/store/newsStore"
import { useNewsGeneration } from "@/hooks/useNewsGeneration"
import { API_CONFIG } from "@/config/api"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function Home() {
  const [selectedSection, setSelectedSection] = useState(API_CONFIG.DEFAULT_SECTIONS[0])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const {
    articles,
    savedArticles,
    sections,
    customTopics,
    addArticle,
    saveArticle,
    removeArticle,
    addKeyword,
    removeKeyword,
  } = useNewsStore()
  
  const { generateArticle, generateTrendingTopics } = useNewsGeneration()

  // Load initial articles
  useEffect(() => {
    const loadArticles = async () => {
      setIsLoading(true)
      setError(null)
      try {
        await generateArticle(selectedSection)
      } catch (error: any) {
        setError(error?.message || 'Failed to load articles. Please check your API configuration.')
      } finally {
        setIsLoading(false)
      }
    }

    loadArticles()
  }, [selectedSection])

  const filteredArticles = articles.filter(
    article => article.section === selectedSection
  )

  const savedArticleIds = savedArticles.map(article => article.id)

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article, index) => (
              <ArticleTile
                key={article.id}
                article={article}
                index={index}
                onSave={saveArticle}
                onKeywordAdd={(keyword) => addKeyword(article.id, keyword)}
                onKeywordRemove={(keyword) => removeKeyword(article.id, keyword)}
                saved={savedArticleIds.includes(article.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
