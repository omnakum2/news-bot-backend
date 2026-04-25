import { GoogleGenAI } from "@google/genai";
import type { Article } from "../NewsModule/NewsService";
import { AI_PROMPT, buildUserPrompt } from "./utils/promptUtil";


export type SummarizationResult = string;

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables. Please add it to .env.");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export async function summarizeArticles(
  articles: Article[]
): Promise<SummarizationResult> {
  const ai = getAiClient();
  const userPrompt = buildUserPrompt(articles);

  const fullPrompt = `${AI_PROMPT}\n\n${userPrompt}`;
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: fullPrompt,
  });

  const content = response.text;

  if (!content) {
    throw new Error("Google GenAI returned an empty response.");
  }

  return content.trim();
}
