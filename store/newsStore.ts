import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Article {
  id: string;
  headline: string;
  content: string;
  summary?: string;
  keywords?: string[];
  section: string;
  publishedAt?: string;
  timestamp: number;  // Required timestamp in milliseconds
}

interface SectionData {
  articles: Article[];
  lastUpdated: number;
}

interface NewsState {
  sectionData: Record<string, SectionData>;
  savedArticles: Article[];
  selectedSection: string;
  articleCount: number;
  addArticles: (articles: Article[], section: string) => void;
  saveArticle: (article: Article) => void;
  removeArticle: (id: string) => void;
  setSelectedSection: (section: string) => void;
  setArticleCount: (count: number) => void;
  getArticlesForSection: (section: string) => Article[];
  getSectionLastUpdated: (section: string) => number;
  needsUpdate: (section: string) => boolean;
}

export const useNewsStore = create<NewsState>()(
  persist(
    (set, get) => ({
      sectionData: {},
      savedArticles: [],
      selectedSection: "Breaking News",
      articleCount: 5,

      addArticles: (articles, section) =>
        set((state) => ({
          sectionData: {
            ...state.sectionData,
            [section]: {
              articles,
              lastUpdated: Date.now(),
            },
          },
        })),

      saveArticle: (article) =>
        set((state) => ({
          savedArticles: [article, ...state.savedArticles.filter((a) => a.id !== article.id)],
        })),

      removeArticle: (id) =>
        set((state) => ({
          savedArticles: state.savedArticles.filter((a) => a.id !== id),
        })),

      setSelectedSection: (section) => set({ selectedSection: section }),
      
      setArticleCount: (count) => set({ articleCount: count }),

      getArticlesForSection: (section) => {
        const state = get();
        const sectionArticles = state.sectionData[section]?.articles;
        return Array.isArray(sectionArticles) ? sectionArticles : [];
      },

      getSectionLastUpdated: (section) => {
        const state = get();
        return state.sectionData[section]?.lastUpdated || 0;
      },

      needsUpdate: (section) => {
        const state = get();
        const sectionData = state.sectionData[section];
        if (!sectionData || !sectionData.articles.length) return true;
        
        const hourInMs = 60 * 60 * 1000;
        const timeSinceLastUpdate = Date.now() - sectionData.lastUpdated;
        return timeSinceLastUpdate > hourInMs;
      },
    }),
    {
      name: "news-store",
    }
  )
);
