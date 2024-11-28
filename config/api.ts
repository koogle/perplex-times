export const API_CONFIG = {
  PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY || '',
  CACHE_DURATION: 1000 * 60 * 5, // 5 minutes
  DEFAULT_SECTIONS: ['News', 'Politics', 'Economy', 'Sports', 'Technology'],
  MAX_ARTICLES_PER_PAGE: 12,
  MAX_SAVED_ARTICLES: 100,
};
