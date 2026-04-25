import type { Article } from "../NewsModule/NewsService";
import { AI_PROMPT, buildUserPrompt } from "./utils/promptUtil";

export type SummarizationResult = string;

async function callGeminiApi(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status}`);
  }

  const data = await res.json() as any;
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

export async function summarizeArticles(
  articles: Article[]
): Promise<SummarizationResult> {
  const userPrompt = buildUserPrompt(articles);
  const fullPrompt = `${AI_PROMPT}\n\n${userPrompt}`;

  const content = await callGeminiApi(fullPrompt);

  if (!content) {
    throw new Error("Gemini returned an empty response.");
  }

  return content.trim();
}
