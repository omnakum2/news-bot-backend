import "dotenv/config";
import { filterRecentNews } from "./utils/newsFilter";

export interface Article {
  title: string;
  description: string;
  link: string;
  pubDate: string;
}

const NEWSDATA_BASE_URL = "https://newsdata.io/api/1/news";

async function fetchFromNewsdata(endpointParams: string): Promise<Article[]> {
  const apiKey = process.env.NEWSDATA_API_KEY;
  if (!apiKey) {
    throw new Error("NEWSDATA_API_KEY is not set in environment variables.");
  }

  const url = `${NEWSDATA_BASE_URL}?apikey=${apiKey}&${endpointParams}`;
  const response = await fetch(url);

  if (response.status === 429) {
    console.warn("⚠️ Rate limit reached (429). Retrying after 2 seconds...");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return fetchFromNewsdata(endpointParams);
  }

  if (!response.ok) {
    throw new Error(`Newsdata API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as any;
  const results = data.results || [];

  const mappedResults = results.map((item: any) => ({
    title: item.title || "",
    description: item.description || "",
    link: item.link || "",
    pubDate: item.pubDate || "",
  }));

  const filteredResults = filterRecentNews(mappedResults);

  return filteredResults.slice(0, 10);
}

export async function fetchTechNews(): Promise<Article[]> {
  // Global tech news focusing on AI / Startups
  return fetchFromNewsdata("category=technology&language=en&q=AI%20OR%20startups");
}

export async function fetchSportsNews(): Promise<Article[]> {
  // India sports news focusing on IPL / cricket
  return fetchFromNewsdata("category=sports&country=in&language=en&q=IPL%20OR%20cricket");
}

export async function fetchAllNews(categoryParams?: string): Promise<Article[]> {
  if (categoryParams === "technology") {
    return fetchTechNews();
  }

  if (categoryParams === "sports") {
    return fetchSportsNews();
  }

  const techNews = await fetchTechNews();
  // Delay between requests to prevent rapid rate limit triggering on free accounts
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const sportsNews = await fetchSportsNews();

  return [...techNews, ...sportsNews];
}
