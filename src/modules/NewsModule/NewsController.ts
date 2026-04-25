import { fetchAllNews } from "./NewsService";
import type { Article } from "./NewsService";

export interface NewsArchive {
  topNews: Article[];
}

export async function getAllNews(categoryParams?: string): Promise<NewsArchive> {
  const articles = await fetchAllNews(categoryParams);
  return { topNews: articles };
}

export type { Article };
