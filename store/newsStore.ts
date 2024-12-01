import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Article {
  id: string;
  headline: string;
  summary: string;
  section: string;
  timestamp: string;
  longFormContent?: string;
  additionalContext?: string;
  implications?: string;
  isExpanding?: boolean;
}

interface SectionData {
  articles: Article[];
  lastUpdated: string;
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
  getSectionLastUpdated: (section: string) => string;
  needsUpdate: (section: string) => boolean;
  expandArticle: (article: Article) => Promise<void>;
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
              lastUpdated: Date.now().toString(),
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
        return state.sectionData[section]?.lastUpdated || "0";
      },

      needsUpdate: (section) => {
        const state = get();
        const sectionData = state.sectionData[section];
        if (!sectionData || !sectionData.articles.length) return true;
        
        const hourInMs = 60 * 60 * 1000;
        const timeSinceLastUpdate = Date.now() - parseInt(sectionData.lastUpdated);
        return timeSinceLastUpdate > hourInMs;
      },

      expandArticle: async (article: Article) => {
        // Mark article as expanding
        set((state) => ({
          sectionData: {
            ...state.sectionData,
            [article.section]: {
              articles: state.sectionData[article.section].articles.map((a) =>
                a.id === article.id ? { ...a, isExpanding: true } : a
              ),
              lastUpdated: state.sectionData[article.section].lastUpdated,
            },
          },
        }))

        try {
          const response = await fetch("/api/expand", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ headline: article.headline }),
          })

          if (!response.ok) throw new Error("Failed to expand article")

          const expandedData = await response.json()

          // Update article with expanded content
          set((state) => ({
            sectionData: {
              ...state.sectionData,
              [article.section]: {
                articles: state.sectionData[article.section].articles.map((a) =>
                  a.id === article.id
                    ? {
                        ...a,
                        ...expandedData,
                        isExpanding: false,
                      }
                    : a
                ),
                lastUpdated: state.sectionData[article.section].lastUpdated,
              },
            },
          }))
        } catch (error) {
          console.error("Error expanding article:", error)
          // Reset expanding state on error
          set((state) => ({
            sectionData: {
              ...state.sectionData,
              [article.section]: {
                articles: state.sectionData[article.section].articles.map((a) =>
                  a.id === article.id ? { ...a, isExpanding: false } : a
                ),
                lastUpdated: state.sectionData[article.section].lastUpdated,
              },
            },
          }))
        }
      },
    }),
    {
      name: "news-store",
    }
  )
);
