"use client";

import { useState } from "react";
import { Article } from "@/store/newsStore";

interface ArticleCardProps {
  article: Article;
  onSave?: (article: Article) => void;
  onKeywordAdd?: (keyword: string) => void;
  onKeywordRemove?: (keyword: string) => void;
  saved?: boolean;
}

export function ArticleCard({
  article,
  onSave,
  onKeywordAdd,
  onKeywordRemove,
  saved = false,
}: ArticleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");

  const handleKeywordAdd = () => {
    if (newKeyword.trim() && onKeywordAdd) {
      onKeywordAdd(newKeyword.trim());
      setNewKeyword("");
    }
  };

  return (
    <article className="rounded-lg border p-4 shadow-sm transition-all hover:shadow-md">
      <div
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-xl font-bold">{article.headline}</h2>
        <p className="mt-2 text-gray-600">{article.summary}</p>
      </div>

      {/* Keywords */}
      <div className="mt-4 flex flex-wrap gap-2">
        {(article.keywords || []).map((keyword) => (
          <span
            key={keyword}
            className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm"
          >
            {keyword}
            {onKeywordRemove && (
              <button
                onClick={() => onKeywordRemove(keyword)}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            )}
          </span>
        ))}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4">
          <p className="whitespace-pre-wrap text-gray-800">
            {article.isExpanding
              ? "Loading full article..."
              : article.longFormContent}
          </p>

          {/* Add Keyword */}
          {onKeywordAdd && (
            <div className="mt-4 flex items-center gap-2">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Add keyword"
                className="rounded-md border px-3 py-1"
                onKeyPress={(e) => e.key === "Enter" && handleKeywordAdd()}
              />
              <button
                onClick={handleKeywordAdd}
                className="rounded-md bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          )}
        </div>
      )}

      {/* Save Button */}
      {onSave && (
        <button
          onClick={() => onSave(article)}
          className={`mt-4 rounded-md px-4 py-2 ${
            saved
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {saved ? "Saved" : "Save Article"}
        </button>
      )}
    </article>
  );
}
