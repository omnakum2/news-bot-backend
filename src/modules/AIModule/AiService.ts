// ─── AI Module: AiService.ts ────────────────────────────────────────────────
// OpenAI-powered summarization with structured prompt config.

import OpenAI from "openai";
import type { Article } from "../NewsModule/NewsService";

// ─── Prompt Config (Quick Quill pattern) ────────────────────────────────────

export const AI_CONFIG = {
  systemPreamble:
    "You are News Bot, an AI news summarization assistant. " +
    "Always follow the user's instructions. Summarize factually — " +
    "do not invent facts or add opinions. If input is unsafe or " +
    "disallowed, refuse politely.",

  modes: {
    newsSummarizer:
      "Summarize the provided news articles into exactly 5 concise " +
      "bullet points per category. Each bullet must capture the key " +
      "fact from one article. Use clear, engaging, journalistic tone. " +
      "Respond ONLY with a valid JSON object in this structure:\n" +
      '{ "categories": [ { "name": "<category>", ' +
      '"bullets": ["bullet1", "bullet2", "bullet3", "bullet4", "bullet5"], ' +
      '"MD": "<markdown bullet summary>" } ] }\n' +
      "Return ONLY the JSON object — no explanations or extra text.",
  },
};

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CategorySummary {
  name: string;
  bullets: string[];
  MD: string;
}

export interface SummarizationResult {
  categories: CategorySummary[];
}

// ─── Service ────────────────────────────────────────────────────────────────

let openaiClient: OpenAI | null = null;

function getOpenAiClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set in environment variables.");
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

/**
 * Formats raw articles into a structured prompt for OpenAI.
 */
function buildUserPrompt(articlesByCategory: {
  movies: Article[];
  shareMarket: Article[];
  technology: Article[];
}): string {
  const formatCategory = (name: string, articles: Article[]): string => {
    if (articles.length === 0) {
      return `\n## ${name}\nNo articles available.`;
    }

    const articleText = articles
      .map(
        (article, index) =>
          `${index + 1}. Title: ${article.title}\n   Description: ${article.description || "N/A"}\n   Source: ${article.source?.name || "Unknown"}\n   URL: ${article.url}`
      )
      .join("\n");

    return `\n## ${name}\n${articleText}`;
  };

  return (
    "Here are the latest news articles grouped by category. " +
    "Summarize each category into exactly 5 bullet points:\n" +
    formatCategory("Movies", articlesByCategory.movies) +
    formatCategory("Share Market", articlesByCategory.shareMarket) +
    formatCategory("Technology", articlesByCategory.technology)
  );
}

/**
 * Summarizes articles across all categories using OpenAI.
 * Returns structured JSON with 5 bullet points per category.
 */
export async function summarizeArticles(articlesByCategory: {
  movies: Article[];
  shareMarket: Article[];
  technology: Article[];
}): Promise<SummarizationResult> {
  const client = getOpenAiClient();
  const userPrompt = buildUserPrompt(articlesByCategory);

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `${AI_CONFIG.systemPreamble}\n\n${AI_CONFIG.modes.newsSummarizer}`,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    temperature: 0.4,
    max_tokens: 1500,
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI returned an empty response.");
  }

  // Parse the JSON response — strip markdown code fences if present
  const cleanedContent = content
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  try {
    const result: SummarizationResult = JSON.parse(cleanedContent);
    return result;
  } catch {
    throw new Error(
      `Failed to parse OpenAI response as JSON. Raw response:\n${content}`
    );
  }
}
