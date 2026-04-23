// ─── BotService.ts ──────────────────────────────────────────────────────────
// Main orchestrator: Fetch News → Summarize with AI → Send Email.

import { getAllNews } from "./modules/NewsModule/NewsController";
import { summarizeNews } from "./modules/AIModule/AiController";
import { sendNewsEmail } from "./modules/EmailModule/EmailController";
import type { SummarizationResult } from "./modules/AIModule/AiService";

export interface BotResponse {
  success: boolean;
  message: string;
  greeting: string;
  summary: SummarizationResult | null;
  sentTo: string;
}

/**
 * Handles the complete news pipeline.
 * 1. Fetch latest news from GNews (3 categories in parallel)
 * 2. Summarize with OpenAI (5 bullet points per category)
 * 3. Send formatted email to recipient
 *
 * @param recipientEmail - Email to send   to (optional, falls back to DEFAULT_EMAIL)
 */
export async function handleBotRequest(
  recipientEmail?: string
): Promise<BotResponse> {
  const targetEmail =
    recipientEmail || process.env.DEFAULT_EMAIL;

  if (!targetEmail) {
    return {
      success: false,
      message:
        "No email provided and DEFAULT_EMAIL is not set. Pass ?email=your@email.com or set DEFAULT_EMAIL in .env",
      greeting: "",
      summary: null,
      sentTo: "",
    };
  }

  console.log("\n════════════════════════════════════════════");
  console.log("🚀 News Bot — Starting pipeline...");
  console.log("════════════════════════════════════════════\n");

  // Step 1: Fetch news
  const newsData = await getAllNews();

  // Step 2: Summarize with AI
  const summary = await summarizeNews(newsData);

  // Step 3: Send email
  const greeting = await sendNewsEmail(targetEmail, summary);

  console.log("\n════════════════════════════════════════════");
  console.log("✅ Pipeline complete!");
  console.log("════════════════════════════════════════════\n");

  return {
    success: true,
    message: "News generated and emailed successfully!",
    greeting,
    summary,
    sentTo: targetEmail,
  };
}
