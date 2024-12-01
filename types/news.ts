import { z } from 'zod';

export const NewsItemSchema = z.object({
  headline: z.string().describe('The headline of the news article'),
  summary: z.string().describe('A brief summary of the news article'),
  source: z.string().optional().describe('The source of the news article'),
  timestamp: z.string().describe('ISO timestamp of when the article was published'),
  section: z.string().describe('The section this news belongs to (e.g., Technology, Politics)'),
});

export const NewsResponseSchema = z.object({
  articles: z.array(NewsItemSchema),
});

export type NewsItem = z.infer<typeof NewsItemSchema>;
export type NewsResponse = z.infer<typeof NewsResponseSchema>;
