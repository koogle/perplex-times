import { Message } from 'ai';

interface PerplexityResponse {
  content: string;
  citations: string[];
}

export class PerplexityAPI {
  private async makeRequest(messages: Message[], type: 'article' | 'headline' | 'trending'): Promise<PerplexityResponse> {
    try {
      const response = await fetch('/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          type
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let content = '';
      let citations: string[] = [];

      if (!reader) {
        throw new Error('No reader available');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        content += chunk;

        // Extract citations if they exist in the response
        const citationMatch = chunk.match(/\[(.*?)\]/g);
        if (citationMatch) {
          citations = citationMatch.map(c => c.slice(1, -1));
        }
      }

      return { content, citations };
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async generateHeadline(topic: string): Promise<{ headline: string; citations: string[] }> {
    const { content, citations } = await this.makeRequest([
      {
        role: 'user',
        content: `Generate a headline about: ${topic}`
      }
    ], 'headline');

    return {
      headline: content.trim(),
      citations
    };
  }

  async generateArticle(headline: string): Promise<{
    content: string;
    keywords: string[];
    sources: string[];
    citations: string[];
  }> {
    const { content, citations } = await this.makeRequest([
      {
        role: 'user',
        content: `Write a comprehensive news article for the headline: ${headline}`
      }
    ], 'article');

    const parts = content.split('[KEYWORDS]');
    const articleContent = parts[0].replace('[CONTENT]', '').trim();
    const keywords = parts[1]?.split(',').map(k => k.trim()) || this.extractKeywords(articleContent);

    return {
      content: articleContent,
      keywords,
      sources: citations,
      citations
    };
  }

  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase().split(/\W+/);
    const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with']);
    return [...new Set(words.filter(word => 
      word.length > 3 && !stopWords.has(word)
    ))].slice(0, 5);
  }

  async generateTrendingTopics(): Promise<{
    topics: string[];
    citations: string[];
  }> {
    const { content, citations } = await this.makeRequest([
      {
        role: 'user',
        content: 'What are the top 5 trending news topics right now?'
      }
    ], 'trending');

    const topics = content
      .split('\n')
      .map(topic => topic.replace(/^\d+[\.\)]\s*/, '').trim())
      .filter(topic => topic.length > 0);

    return {
      topics,
      citations
    };
  }
}

// Utility for local storage management
export const LocalStorageUtil = {
  saveArticle: (article: any) => {
    const savedArticles = JSON.parse(localStorage.getItem('savedArticles') || '[]');
    savedArticles.push(article);
    localStorage.setItem('savedArticles', JSON.stringify(savedArticles));
  },
  
  getSavedArticles: () => {
    return JSON.parse(localStorage.getItem('savedArticles') || '[]');
  },

  removeArticle: (articleId: string) => {
    const savedArticles = JSON.parse(localStorage.getItem('savedArticles') || '[]');
    const updatedArticles = savedArticles.filter((article: any) => article.id !== articleId);
    localStorage.setItem('savedArticles', JSON.stringify(updatedArticles));
  }
};
