// ─── AI Module: AiController.ts ─────────────────────────────────────────────
// Controller wrapper for AI summarization operations.

import { summarizeArticles } from "./AiService";
import type { SummarizationResult } from "./AiService";
import type { Article } from "../NewsModule/NewsService";

/**
 * Orchestrates the summarization of news articles.
 * Logs progress and delegates to AiService.
 */
export async function summarizeNews(articlesByCategory: {
  movies: Article[];
  shareMarket: Article[];
  technology: Article[];
}): Promise<SummarizationResult> {
  const totalArticles =
    articlesByCategory.movies.length +
    articlesByCategory.shareMarket.length +
    articlesByCategory.technology.length;

  console.log(`🤖 Summarizing ${totalArticles} articles with OpenAI...`);

  const result = await summarizeArticles(articlesByCategory);

  console.log(
    `  ✅ Generated summaries for ${result.categories.length} categories`
  );

  return result;
}

export type { SummarizationResult };
