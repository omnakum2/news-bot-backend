import { summarizeArticles } from "./AiService";
import type { SummarizationResult } from "./AiService";
import type { Article } from "../NewsModule/NewsService";

export async function summarizeNews(
  articles: Article[]
): Promise<SummarizationResult> {
  const result = await summarizeArticles(articles);
  return result;
}

export type { SummarizationResult };
