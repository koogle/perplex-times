"use client"

import { useEffect, useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { ArticleTile } from "@/components/article-tile"
import { useNewsStore } from "@/store/newsStore"
import { useNewsGeneration } from "@/hooks/useNewsGeneration"
import { API_CONFIG } from "@/config/api"

export default function Home() {
  const [selectedSection, setSelectedSection] = useState(API_CONFIG.DEFAULT_SECTIONS[0])
  const [isLoading, setIsLoading] = useState(false)
  
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
      try {
        await generateArticle(selectedSection)
      } catch (error) {
        console.error('Error loading articles:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadArticles()
  }, [selectedSection])

  // Load trending topics periodically
  useEffect(() => {
    const loadTrendingTopics = async () => {
      try {
        const topics = await generateTrendingTopics()
        topics.forEach(topic => {
          if (!customTopics.includes(topic) && !sections.includes(topic)) {
            addCustomTopic(topic)
          }
        })
      } catch (error) {
        console.error('Error loading trending topics:', error)
      }
    }

    loadTrendingTopics()
    const interval = setInterval(loadTrendingTopics, 1000 * 60 * 30) // Every 30 minutes

    return () => clearInterval(interval)
  }, [])

  const filteredArticles = articles.filter(
    article => article.section === selectedSection
  )

  const savedArticleIds = savedArticles.map(article => article.id)

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 [&>*]:border-black [&>*]:border-[1px] [&>*:nth-child(n+4)]:border-t-0 [&>*:nth-child(3n+2)]:border-x-0">
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
