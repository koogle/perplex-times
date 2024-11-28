import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Article {
  id: string;
  headline: string;
  content: string;
  summary: string;
  keywords: string[];
  sources: string[];
  citations: string[];
  section: string;
  timestamp: number;
}

interface NewsState {
  articles: Article[];
  savedArticles: Article[];
  sections: string[];
  customTopics: string[];
  userKeywords: string[];
  addArticle: (article: Article) => void;
  saveArticle: (article: Article) => void;
  removeArticle: (id: string) => void;
  addSection: (section: string) => void;
  removeSection: (section: string) => void;
  addCustomTopic: (topic: string) => void;
  removeCustomTopic: (topic: string) => void;
  addUserKeyword: (keyword: string) => void;
  removeUserKeyword: (keyword: string) => void;
}

export const useNewsStore = create<NewsState>()(
  persist(
    (set) => ({
      articles: [],
      savedArticles: [],
      sections: ['News', 'Politics', 'Economy', 'Sports', 'Technology'],
      customTopics: [],
      userKeywords: [],

      addArticle: (article) =>
        set((state) => ({
          articles: [article, ...state.articles]
        })),

      saveArticle: (article) =>
        set((state) => ({
          savedArticles: [article, ...state.savedArticles]
        })),

      removeArticle: (id) =>
        set((state) => ({
          savedArticles: state.savedArticles.filter((article) => article.id !== id)
        })),

      addSection: (section) =>
        set((state) => ({
          sections: [...state.sections, section]
        })),

      removeSection: (section) =>
        set((state) => ({
          sections: state.sections.filter((s) => s !== section)
        })),

      addCustomTopic: (topic) =>
        set((state) => ({
          customTopics: [...state.customTopics, topic]
        })),

      removeCustomTopic: (topic) =>
        set((state) => ({
          customTopics: state.customTopics.filter((t) => t !== topic)
        })),

      addUserKeyword: (keyword) =>
        set((state) => ({
          userKeywords: [...state.userKeywords, keyword]
        })),

      removeUserKeyword: (keyword) =>
        set((state) => ({
          userKeywords: state.userKeywords.filter((k) => k !== keyword)
        })),
    }),
    {
      name: 'perplex-times-storage',
    }
  )
);
