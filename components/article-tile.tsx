"use client"

import { useState } from "react"
import { Tag, Bookmark, BookmarkCheck } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Article } from "@/store/newsStore"

interface ArticleTileProps {
  article: Article
  onSave?: (article: Article) => void
  onKeywordAdd?: (keyword: string) => void
  onKeywordRemove?: (keyword: string) => void
  saved?: boolean
  index: number
}

export function ArticleTile({
  article,
  onSave,
  onKeywordAdd,
  onKeywordRemove,
  saved = false,
  index
}: ArticleTileProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [newKeyword, setNewKeyword] = useState("")

  const addKeyword = () => {
    if (newKeyword.trim() && onKeywordAdd) {
      onKeywordAdd(newKeyword.trim())
      setNewKeyword("")
    }
  }

  const removeKeyword = (keyword: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onKeywordRemove) {
      onKeywordRemove(keyword)
    }
  }

  return (
    <motion.div
      layout
      className={cn(
        "group relative aspect-square bg-card text-card-foreground transition-colors duration-300 hover:bg-accent/50",
        isExpanded && "col-span-2 row-span-3 aspect-auto z-50 bg-background border-black shadow-xl"
      )}
      onClick={() => !isExpanded && setIsExpanded(true)}
    >
      <motion.div
        layout
        className={cn(
          "h-full w-full p-4",
          isExpanded ? "overflow-y-auto" : "overflow-hidden"
        )}
      >
        {isExpanded && (
          <Button
            size="sm"
            variant="ghost"
            className="absolute right-4 top-4"
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(false)
            }}
          >
            ×
          </Button>
        )}
        <motion.h3
          layout="position"
          className="text-lg font-semibold leading-tight mb-2"
        >
          {article.headline}
        </motion.h3>
        <motion.p
          layout="position"
          className="text-sm text-muted-foreground line-clamp-3"
        >
          {article.summary}
        </motion.p>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 space-y-4"
            >
              <div className="prose prose-sm dark:prose-invert">
                {article.content}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  <span className="text-sm font-medium">Keywords</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {article.keywords.map((keyword) => (
                    <Badge 
                      key={keyword} 
                      variant="secondary" 
                      className="border-black group/badge"
                    >
                      {keyword}
                      {onKeywordRemove && (
                        <button
                          onClick={(e) => removeKeyword(keyword, e)}
                          className="ml-1 hidden group-hover/badge:inline-block"
                        >
                          ×
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {onKeywordAdd && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add keyword"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addKeyword()}
                      className="border-black focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation()
                        addKeyword()
                      }}
                      className="border-black"
                    >
                      Add
                    </Button>
                  </div>
                )}
              </div>
              {article.sources.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Sources</h4>
                  <ul className="list-disc pl-4 text-sm text-muted-foreground">
                    {article.sources.map((source, index) => (
                      <li key={index}>
                        <a 
                          href={source} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {source}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {onSave && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    onSave(article)
                  }}
                  className="border-black"
                  variant={saved ? "secondary" : "default"}
                >
                  {saved ? (
                    <>
                      <BookmarkCheck className="mr-2 h-4 w-4" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Bookmark className="mr-2 h-4 w-4" />
                      Save Article
                    </>
                  )}
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          layout="position"
          className="absolute bottom-2 left-4 right-4"
        >
          <div className="flex flex-wrap gap-2">
            {article.keywords.slice(0, 3).map((keyword) => (
              <Badge key={keyword} variant="secondary" className="border-black">
                {keyword}
              </Badge>
            ))}
            {article.keywords.length > 3 && (
              <Badge variant="outline" className="border-black">
                +{article.keywords.length - 3}
              </Badge>
            )}
          </div>
        </motion.div>
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </motion.div>
  )
}
