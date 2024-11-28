'use client';

import { useState } from 'react';
import { useNewsStore } from '@/store/newsStore';
import { ArticleGrid } from '@/components/ArticleGrid';

export default function SavedArticles() {
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const { savedArticles, userKeywords, removeArticle } = useNewsStore();

  // Get all unique keywords from saved articles
  const allKeywords = Array.from(
    new Set(savedArticles.flatMap((article) => article.keywords))
  );

  // Filter articles based on selected keyword
  const filteredArticles = selectedKeyword
    ? savedArticles.filter((article) =>
        article.keywords.includes(selectedKeyword)
      )
    : savedArticles;

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold">Saved Articles</h1>

      {/* Keywords Filter */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Filter by Keyword</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedKeyword(null)}
            className={`rounded-full px-4 py-2 ${
              selectedKeyword === null
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {allKeywords.map((keyword) => (
            <button
              key={keyword}
              onClick={() => setSelectedKeyword(keyword)}
              className={`rounded-full px-4 py-2 ${
                selectedKeyword === keyword
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {keyword}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-8">
        {filteredArticles.length === 0 ? (
          <p className="text-center text-gray-500">No saved articles yet</p>
        ) : (
          <ArticleGrid
            articles={filteredArticles}
            onSave={(article) => removeArticle(article.id)}
            savedArticles={savedArticles.map((article) => article.id)}
          />
        )}
      </div>
    </main>
  );
}
