// ─── News Module: NewsController.ts ─────────────────────────────────────────
// Thin controller wrapper for NewsService operations.

import { fetchAllNews, fetchTopHeadlines, fetchSearchNews } from "./NewsService";
import type { Article } from "./NewsService";

export interface NewsByCategory {
  movies: Article[];
  shareMarket: Article[];
  technology: Article[];
}

/**
 * Orchestrates fetching news across all 3 categories.
 * Returns structured article data grouped by category.
 */
export async function getAllNews(): Promise<NewsByCategory> {
  console.log("📰 Fetching news from GNews API...");

  const newsData = await fetchAllNews();

  console.log(`  ✅ Movies: ${newsData.movies.length} articles`);
  console.log(`  ✅ Share Market: ${newsData.shareMarket.length} articles`);
  console.log(`  ✅ Technology: ${newsData.technology.length} articles`);

  return newsData;
}

export { fetchTopHeadlines, fetchSearchNews };
export type { Article };
