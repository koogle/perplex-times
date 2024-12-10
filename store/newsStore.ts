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
  keywords?: string[];
  isExpanding?: boolean;
}

export interface ExpandedArticle {
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
  lastFetchAttempt: { [section: string]: number };
  streamingContent: { [id: string]: string };

  // Actions
  setArticles: (section: string, articles: Article[]) => void;
  addArticles: (section: string, newArticles: Article[]) => void;
  saveArticle: (article: Article) => void;
  removeArticle: (id: string) => void;
  setSelectedSection: (section: string) => void;
  setExpandedArticle: (id: string, expandedContent: ExpandedArticle) => void;
  setArticleCount: (count: number) => void;
  setLastFetchAttempt: (section: string) => void;
  setStreamingContent: (id: string, content: string) => void;
  appendStreamingContent: (id: string, content: string) => void;

  // Getters
  getArticlesForSection: (section: string) => Article[];
  getSectionLastUpdated: (section: string) => number;
  needsUpdate: (section: string) => boolean;
  expandArticle: (articleId: string, content: ExpandedArticle) => void;
}

export const useNewsStore = create<NewsStore>()(
  persist(
    (set, get) => ({
      articles: {},
      savedArticles: [],
      selectedSection: "Breaking News",
      sectionLastUpdated: {},
      expandedArticles: {},
      articleCount: 6,
      lastFetchAttempt: {},
      streamingContent: {},

      setArticles: (section, articles) => {
        if (!Array.isArray(articles)) {
          console.error("setArticles received non-array articles:", articles);
          return;
        }
        set((state) => ({
          articles: {
            ...state.articles,
            [section]: articles,
          },
          sectionLastUpdated: {
            ...state.sectionLastUpdated,
            [section]: Date.now(),
          },
        }));
      },

      addArticles: (section, newArticles) => {
        if (!Array.isArray(newArticles)) {
          console.error(
            "addArticles received non-array articles:",
            newArticles
          );
          return;
        }
        set((state) => {
          const existingArticles = state.articles[section] || [];
          const existingIds = new Set(
            existingArticles.map((article) => article.id)
          );

          // Filter out duplicates
          const uniqueNewArticles = newArticles.filter(
            (article) => !existingIds.has(article.id)
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
        });
      },

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

      setLastFetchAttempt: (section) =>
        set((state) => ({
          lastFetchAttempt: {
            ...state.lastFetchAttempt,
            [section]: Date.now(),
          },
        })),

      setStreamingContent: (id, content) =>
        set((state) => ({
          streamingContent: { ...state.streamingContent, [id]: content },
        })),

      appendStreamingContent: (id, content) =>
        set((state) => ({
          streamingContent: {
            ...state.streamingContent,
            [id]: (state.streamingContent[id] || '') + content,
          },
        })),

      getArticlesForSection: (section) => {
        const state = get();
        const articles = state.articles[section];
        return Array.isArray(articles) ? articles : [];
      },

      getSectionLastUpdated: (section) => {
        const state = get();
        return state.sectionLastUpdated[section] || 0;
      },

      needsUpdate: (section) => {
        const state = get();
        const lastUpdated = state.sectionLastUpdated[section] || 0;
        const lastAttempt = state.lastFetchAttempt[section] || 0;
        const now = Date.now();

        // Don't update if we've attempted a fetch in the last 10 seconds
        if (now - lastAttempt < 10000) {
          return false;
        }

        // Always update if we have no articles
        const articles = state.articles[section];
        if (!articles || !Array.isArray(articles) || articles.length === 0) {
          return true;
        }

        // Update if the content is older than 5 minutes
        return now - lastUpdated > 5 * 60 * 1000;
      },

      expandArticle: (articleId, content) =>
        set((state) => ({
          expandedArticles: {
            ...state.expandedArticles,
            [articleId]: {
              ...content,
              lastUpdated: Date.now(),
            },
          },
        })),
    }),
    {
      name: "news-store",
    }
  )
);
