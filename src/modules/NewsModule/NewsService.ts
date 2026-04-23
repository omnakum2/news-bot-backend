// ─── News Module: NewsService.ts ────────────────────────────────────────────
// Handles all GNews API calls for fetching latest news articles.

export interface Article {
  title: string;
  description: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
}

interface GNewsResponse {
  totalArticles: number;
  articles: Article[];
}

const GNEWS_BASE_URL = "https://gnews.io/api/v4";

/**
 * Fetches top headlines from GNews by category.
 * Uses the Top Headlines endpoint.
 */
export async function fetchTopHeadlines(
  category: string,
  maxArticles: number = 5
): Promise<Article[]> {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    throw new Error("GNEWS_API_KEY is not set in environment variables.");
  }

  const url = `${GNEWS_BASE_URL}/top-headlines?category=${encodeURIComponent(category)}&lang=en&max=${maxArticles}&apikey=${apiKey}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `GNews API error (top-headlines/${category}): ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as GNewsResponse;
  return data.articles || [];
}

/**
 * Fetches articles from GNews by search query.
 * Uses the Search endpoint — ideal for topics like "movies" that don't have a direct category.
 */
export async function fetchSearchNews(
  query: string,
  maxArticles: number = 5
): Promise<Article[]> {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    throw new Error("GNEWS_API_KEY is not set in environment variables.");
  }

  const url = `${GNEWS_BASE_URL}/search?q=${encodeURIComponent(query)}&lang=en&max=${maxArticles}&sortby=publishedAt&apikey=${apiKey}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `GNews API error (search/${query}): ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as GNewsResponse;
  return data.articles || [];
}

/**
 * Fetches all news across the 3 categories in parallel.
 * - Movies: Search endpoint with q="movies"
 * - Share Market: Top Headlines with category="business"
 * - Technology: Top Headlines with category="technology"
 */
export async function fetchAllNews(): Promise<{
  movies: Article[];
  shareMarket: Article[];
  technology: Article[];
}> {
  const [movies, shareMarket, technology] = await Promise.all([
    fetchSearchNews("movies"),
    fetchTopHeadlines("business"),
    fetchTopHeadlines("technology"),
  ]);

  return { movies, shareMarket, technology };
}
