import { useState } from 'react';
import { useChat } from 'ai/react';
import { useNewsStore } from '@/store/newsStore';
import { Cache } from '@/utils/cache';

export function useNewsGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { addArticle } = useNewsStore();
  const { messages, setMessages } = useChat();

  const generateArticle = async (topic: string) => {
    setIsGenerating(true);
    
    try {
      // Check cache first
      const cacheKey = `article-${topic}`;
      const cachedArticle = Cache.get(cacheKey);
      
      if (cachedArticle) {
        addArticle(cachedArticle);
        return cachedArticle;
      }

      // Generate headline first
      setMessages([
        { role: 'user', content: `Generate a headline about: ${topic}` }
      ]);

      // Wait for the headline generation to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      const headline = messages[messages.length - 1].content;

      // Generate full article
      setMessages([
        { role: 'user', content: `Write a comprehensive news article for the headline: ${headline}` }
      ]);

      // Wait for the article generation to complete
      await new Promise(resolve => setTimeout(resolve, 2000));

      const content = messages[messages.length - 1].content;
      const parts = content.split('[KEYWORDS]');
      const articleContent = parts[0].replace('[CONTENT]', '').trim();
      const keywords = parts[1]?.split(',').map(k => k.trim()) || [];

      const article = {
        id: Date.now().toString(),
        headline,
        content: articleContent,
        summary: articleContent.split('.').slice(0, 2).join('.') + '.',
        keywords,
        sources: [],
        citations: [],
        section: topic,
        timestamp: Date.now()
      };

      // Cache the article
      Cache.set(cacheKey, article);
      addArticle(article);

      return article;
    } catch (error) {
      console.error('Error generating article:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTrendingTopics = async () => {
    const cacheKey = 'trending-topics';
    const cachedTopics = Cache.get(cacheKey);
    
    if (cachedTopics) {
      return cachedTopics;
    }

    setMessages([
      { role: 'user', content: 'What are the top 5 trending news topics right now?' }
    ]);

    // Wait for the topics generation to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    const content = messages[messages.length - 1].content;
    const topics = content
      .split('\n')
      .map(topic => topic.replace(/^\d+[\.\)]\s*/, '').trim())
      .filter(topic => topic.length > 0);

    Cache.set(cacheKey, topics);
    return topics;
  };

  return {
    generateArticle,
    generateTrendingTopics,
    isGenerating
  };
}
