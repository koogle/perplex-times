'use client';

import { Article } from '@/store/newsStore';
import { ArticleCard } from './ArticleCard';

interface ArticleGridProps {
  articles: Article[];
  onSave?: (article: Article) => void;
  onKeywordAdd?: (articleId: string, keyword: string) => void;
  onKeywordRemove?: (articleId: string, keyword: string) => void;
  savedArticles?: string[];
}

export function ArticleGrid({
  articles,
  onSave,
  onKeywordAdd,
  onKeywordRemove,
  savedArticles = [],
}: ArticleGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          onSave={onSave}
          onKeywordAdd={
            onKeywordAdd
              ? (keyword) => onKeywordAdd(article.id, keyword)
              : undefined
          }
          onKeywordRemove={
            onKeywordRemove
              ? (keyword) => onKeywordRemove(article.id, keyword)
              : undefined
          }
          saved={savedArticles.includes(article.id)}
        />
      ))}
    </div>
  );
}
