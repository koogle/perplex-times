import { z } from "zod";

export const headlineSchema = z.object({
  headline: z.string().describe("A concise, engaging news headline"),
});

export const articleSchema = z.object({
  content: z.string().describe("The main article content"),
  keywords: z.array(z.string()).describe("Keywords related to the article"),
});

export const trendingSchema = z.object({
  topics: z
    .array(
      z.object({
        title: z.string().describe("Title of the trending topic"),
        description: z
          .string()
          .describe("Brief description of why this topic is trending"),
      })
    )
    .describe("List of trending news topics"),
});
