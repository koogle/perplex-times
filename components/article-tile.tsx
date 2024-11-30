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
  onRemove?: () => void
  saved?: boolean
  index: number
}

export function ArticleTile({
  article,
  onSave,
  onRemove,
  saved = false,
  index
}: ArticleTileProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Generate a summary from the content if not provided
  const summary = article.summary || article.content?.split('.').slice(0, 2).join('.') + '.'

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
          {summary}
        </motion.p>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 space-y-4"
            >
              <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap">
                {article.content}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  <span className="text-sm font-medium">Keywords</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {article.keywords?.map((keyword, i) => (
                    <Badge key={i} variant="outline">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {new Date(article.publishedAt).toLocaleDateString()}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (saved && onRemove) {
                      onRemove()
                    } else if (onSave) {
                      onSave(article)
                    }
                  }}
                >
                  {saved ? (
                    <BookmarkCheck className="h-4 w-4" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
