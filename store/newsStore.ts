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

interface ExpandedArticle {
  longFormContent: string;
  additionalContext: string;
  implications: string;
  lastUpdated: number;
}

interface NewsStore {
  articles: { [section: string]: Article[] };
  savedArticles: Article[];
  selectedSection: string;
  sectionLastUpdated: { [section: string]: number };
  expandedArticles: { [id: string]: ExpandedArticle };
  articleCount: number;

  // Actions
  setArticles: (section: string, articles: Article[]) => void;
  addArticles: (section: string, newArticles: Article[]) => void;
  saveArticle: (article: Article) => void;
  removeArticle: (id: string) => void;
  setSelectedSection: (section: string) => void;
  setExpandedArticle: (id: string, expandedContent: ExpandedArticle) => void;
  setArticleCount: (count: number) => void;

  // Getters
  getArticlesForSection: (section: string) => Article[];
  getSectionLastUpdated: (section: string) => number;
  needsUpdate: (section: string) => boolean;
}

const ONE_WEEK = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export const useNewsStore = create<NewsStore>()(
  persist(
    (set, get) => ({
      articles: {},
      savedArticles: [],
      selectedSection: "Breaking News",
      sectionLastUpdated: {},
      expandedArticles: {},
      articleCount: 6,

      setArticles: (section, articles) =>
        set((state) => ({
          articles: {
            ...state.articles,
            [section]: articles,
          },
          sectionLastUpdated: {
            ...state.sectionLastUpdated,
            [section]: Date.now(),
          },
        })),

      addArticles: (section, newArticles) =>
        set((state) => {
          const existingArticles = state.articles[section] || [];
          const existingIds = new Set(existingArticles.map(article => article.id));
          
          // Filter out duplicates
          const uniqueNewArticles = newArticles.filter(
            article => !existingIds.has(article.id)
          );

          return {
            articles: {
              ...state.articles,
              [section]: [...existingArticles, ...uniqueNewArticles],
            },
            sectionLastUpdated: {
              ...state.sectionLastUpdated,
              [section]: Date.now(),
            },
          };
        }),

      saveArticle: (article) =>
        set((state) => ({
          savedArticles: [...state.savedArticles, article],
        })),

      removeArticle: (id) =>
        set((state) => ({
          savedArticles: state.savedArticles.filter(
            (article) => article.id !== id
          ),
        })),

      setSelectedSection: (section) => set({ selectedSection: section }),

      setExpandedArticle: (id, expandedContent) =>
        set((state) => ({
          expandedArticles: {
            ...state.expandedArticles,
            [id]: {
              ...expandedContent,
              lastUpdated: Date.now(),
            },
          },
        })),

      setArticleCount: (count) => set({ articleCount: count }),

      getArticlesForSection: (section) => {
        const state = get();
        return state.articles[section] || [];
      },

      getSectionLastUpdated: (section) => {
        const state = get();
        return state.sectionLastUpdated[section] || 0;
      },

      needsUpdate: (section) => {
        const state = get();
        const lastUpdated = state.sectionLastUpdated[section] || 0;
        return Date.now() - lastUpdated > ONE_WEEK;
      },
    }),
    {
      name: "news-store",
    }
  )
);
