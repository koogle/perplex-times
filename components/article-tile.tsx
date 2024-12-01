"use client"

import { useState } from "react"
import { Tag, Bookmark, BookmarkCheck, X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { formatTime } from "@/lib/utils/time"
import { Article } from "@/store/newsStore"

interface ArticleTileProps {
  article: Article
  onSave?: () => void
  onRemove?: () => void
  onClick?: () => void
  onClose?: () => void
  expanded?: boolean
  index: number
}

export function ArticleTile({
  article,
  onSave,
  onRemove,
  onClick,
  onClose,
  expanded,
  index,
}: ArticleTileProps) {
  return (
    <motion.div
      layout="preserve-aspect"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ 
        duration: 0.8,
        delay: index * 0.3,
        ease: "easeInOut",
        layout: {
          duration: 0.3
        }
      }}
      onClick={onClick}
      className={cn(
        "group relative rounded-none border border-neutral-200 p-4 transition-colors",
        expanded ? "h-[calc(100vh-12rem)] overflow-y-auto" : "hover:-translate-y-1 hover:shadow-lg cursor-pointer",
      )}
      style={!expanded ? { aspectRatio: '1.618' } : undefined}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>{formatTime(article.timestamp)}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSave?.()
                }}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <Bookmark className="h-4 w-4" />
                <span className="sr-only">Save</span>
              </button>
            </div>
            <h2 className={cn(
              "font-medium leading-tight",
              expanded ? "text-2xl" : "text-base"
            )}>
              {article.headline}
            </h2>
          </div>
          {expanded && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClose?.()
              }}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          )}
        </div>

        {expanded ? (
          <div className="space-y-6">
            {article.isExpanding ? (
              <div className="space-y-6">
                <p className="text-neutral-600">{article.summary}</p>
                <div className="flex items-center justify-center space-x-2 text-neutral-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading full article...</span>
                </div>
              </div>
            ) : (
              <>
                {article.longFormContent && (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-base leading-relaxed">{article.longFormContent}</p>
                  </div>
                )}
                {article.additionalContext && (
                  <div className="prose prose-sm max-w-none">
                    <h3 className="text-lg font-medium">Additional Context</h3>
                    <p className="text-sm leading-relaxed text-neutral-600">{article.additionalContext}</p>
                  </div>
                )}
                {article.implications && (
                  <div className="prose prose-sm max-w-none">
                    <h3 className="text-lg font-medium">Implications</h3>
                    <p className="text-sm leading-relaxed text-neutral-600">{article.implications}</p>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <p className="line-clamp-3 text-sm leading-relaxed text-neutral-600">
            {article.summary}
          </p>
        )}
      </div>
    </motion.div>
  )
}
