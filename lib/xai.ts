import { createXai } from '@ai-sdk/xai';

if (!process.env.XAI_API_KEY) {
  throw new Error('Missing XAI_API_KEY environment variable');
}

export const xai = createXai({
  apiKey: process.env.XAI_API_KEY,
});
