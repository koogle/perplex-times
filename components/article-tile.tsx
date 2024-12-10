"use client";

import { Bookmark, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useNewsStore } from "@/store/newsStore";

import { cn } from "@/lib/utils";
import { Article, ExpandedArticle } from "@/store/newsStore";

interface ArticleTileProps {
  article: Article;
  onSave?: () => void;
  onRemove?: () => void;
  onClick?: () => void;
  onClose?: () => void;
  expanded?: boolean;
  index: number;
}

export function ArticleTile({
  article,
  onSave,
  onClose,
  expanded,
  index,
}: ArticleTileProps) {
  const streamingContent = useNewsStore((state) => state.streamingContent[article.id] || '');

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "relative rounded-lg border p-6",
        expanded ? "col-span-2" : ""
      )}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>{article.timestamp}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSave?.();
                }}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <Bookmark className="h-4 w-4" />
                <span className="sr-only">Save</span>
              </button>
            </div>
            <h3 className="font-semibold leading-none tracking-tight">
              {article.headline}
            </h3>
            <p className="text-sm text-muted-foreground">{article.summary}</p>
          </div>
        </div>

        {expanded && (
          <div className="space-y-4">
            {article.isExpanding ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {streamingContent && (
                  <div className="space-y-4 whitespace-pre-wrap leading-relaxed">
                    {streamingContent}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {expanded && onClose && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
    </motion.article>
  );
}
