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
import { cn } from "@/lib/utils/cn"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"

export default function Home() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [expandedArticle, setExpandedArticle] = useState<Article | null>(null)
  
  const {
    selectedSection,
    saveArticle,
    removeArticle,
    articleCount,
    getArticlesForSection,
    getSectionLastUpdated,
    needsUpdate,
    expandArticle
  } = useNewsStore()
  
  const { generateNews, cancelGeneration } = useNewsGeneration()

  const articles = getArticlesForSection(selectedSection)
  const lastUpdated = getSectionLastUpdated(selectedSection)

  // Reset expanded article when section changes
  useEffect(() => {
    setExpandedArticle(null)
  }, [selectedSection])

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
        // Don't show error for aborted requests
        if (error?.name !== 'AbortError') {
          setError(error?.message || 'Failed to load news. Please try again.')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadNews()

    return () => {
      cancelGeneration()
      setError(null)
      setIsLoading(false)
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
              {isLoading ? (
                <div className="text-sm text-muted-foreground animate-pulse">
                  Generating news...
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {lastUpdated > 0 && `Last updated: ${formatTime(lastUpdated)}`}
                </div>
              )}
            </div>
            
            {/* Articles Layout */}
            {(filteredArticles.length > 0 || isLoading) && (
              <LayoutGroup>
                <motion.div
                  layout
                  className={cn(
                    expandedArticle 
                      ? "grid grid-cols-[2fr_1fr] gap-6" 
                      : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                  )}
                >
                  {/* Expanded Article */}
                  <AnimatePresence>
                    {expandedArticle && (
                      <motion.div
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <ArticleTile
                          key={expandedArticle.id}
                          article={expandedArticle}
                          onSave={() => saveArticle(expandedArticle)}
                          onClose={() => setExpandedArticle(null)}
                          expanded={true}
                          index={0}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Article List */}
                  <motion.div
                    layout
                    className={cn(
                      expandedArticle 
                        ? "overflow-y-auto max-h-[calc(100vh-12rem)] space-y-6"
                        : "col-span-full grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                    )}
                  >
                    {isLoading ? (
                      // Loading placeholders
                      Array.from({ length: articleCount }).map((_, index) => (
                        <motion.div 
                          layout
                          key={index} 
                          className="rounded-none border border-black p-4 animate-pulse"
                          style={{ aspectRatio: '1.618' }}
                        >
                          <div className="h-4 w-1/3 bg-black/10 mb-4"></div>
                          <div className="h-6 w-3/4 bg-black/10"></div>
                        </motion.div>
                      ))
                    ) : (
                      filteredArticles
                        .filter(article => article.id !== expandedArticle?.id)
                        .map((article, index) => (
                          <motion.div layout key={article.id}>
                            <ArticleTile
                              article={article}
                              onSave={() => saveArticle(article)}
                              onClick={() => {
                                setExpandedArticle(article)
                                expandArticle(article)
                              }}
                              index={index}
                            />
                          </motion.div>
                        ))
                    )}
                  </motion.div>
                </motion.div>
              </LayoutGroup>
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
                      onRemove={() => removeArticle(article.id)}
                      index={0}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* No Articles Message */}
            {!isLoading && filteredArticles.length === 0 && savedArticlesInSection.length === 0 && (
              <p className="text-center text-muted-foreground">
                No articles found. New articles will appear here.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
