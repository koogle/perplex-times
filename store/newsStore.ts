import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Article {
  id: string;
  headline: string;
  content: string;
  summary?: string;
  keywords: string[];
  section: string;
  publishedAt: string;
  timestamp: number;
}

interface NewsStore {
  selectedSection: string;
  articles: Article[];
  savedArticles: Article[];
  addArticle: (article: Article) => void;
  saveArticle: (article: Article) => void;
  removeArticle: (id: string) => void;
  setSelectedSection: (section: string) => void;
}

export const useNewsStore = create<NewsStore>()(
  persist(
    (set) => ({
      selectedSection: "Breaking News",
      articles: [],
      savedArticles: [],
      addArticle: (article) =>
        set((state) => ({
          articles: [article, ...state.articles.filter((a) => a.id !== article.id)],
        })),
      saveArticle: (article) =>
        set((state) => ({
          savedArticles: [article, ...state.savedArticles.filter((a) => a.id !== article.id)],
        })),
      removeArticle: (id) =>
        set((state) => ({
          savedArticles: state.savedArticles.filter((a) => a.id !== id),
        })),
      setSelectedSection: (section) =>
        set((state) => ({
          selectedSection: section,
          articles: [], // Clear articles when changing sections
        })),
    }),
    {
      name: "news-store",
    }
  )
);
