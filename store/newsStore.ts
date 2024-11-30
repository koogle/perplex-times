import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Article {
  id: string;
  headline: string;
  content: string;
  summary: string;
  keywords: string[];
  section: string;
  publishedAt: string;
  sources: string[];
  citations: string[];
  timestamp: number;
}

interface NewsStore {
  articles: Article[];
  savedArticles: Article[];
  selectedSection: string;
  addArticle: (article: Article) => void;
  removeArticle: (id: string) => void;
  saveArticle: (article: Article) => void;
  unsaveArticle: (id: string) => void;
  setSelectedSection: (section: string) => void;
}

export const useNewsStore = create<NewsStore>()(
  persist(
    (set) => ({
      articles: [],
      savedArticles: [],
      selectedSection: "Breaking News",
      addArticle: (article) =>
        set((state) => ({
          articles: [article, ...state.articles.filter((a) => a.id !== article.id)],
        })),
      removeArticle: (id) =>
        set((state) => ({
          articles: state.articles.filter((article) => article.id !== id),
        })),
      saveArticle: (article) =>
        set((state) => ({
          savedArticles: [
            article,
            ...state.savedArticles.filter((a) => a.id !== article.id),
          ],
        })),
      unsaveArticle: (id) =>
        set((state) => ({
          savedArticles: state.savedArticles.filter(
            (article) => article.id !== id
          ),
        })),
      setSelectedSection: (section) =>
        set((state) => ({
          selectedSection: section,
          // Clear articles when changing sections
          articles: [],
        })),
    }),
    {
      name: "news-store",
    }
  )
);
