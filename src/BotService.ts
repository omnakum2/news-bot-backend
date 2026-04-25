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

export async function handleBotRequest(
  recipientEmail?: string,
  categoryParams?: string
): Promise<BotResponse> {
  const targetEmail = recipientEmail || process.env.DEFAULT_EMAIL;

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

  // Step 1: Fetch news
  const newsData = await getAllNews(categoryParams);

  // Step 2: Summarize with AI
  const summary = await summarizeNews(newsData.topNews);

  // Step 3: Check Importance Filter
  if (summary.includes("NO_IMPORTANT_NEWS")) {
    return {
      success: true,
      message: "No important news today",
      greeting: "",
      summary: summary,
      sentTo: targetEmail,
    };
  }

  // Step 4: Send email
  const greeting = await sendNewsEmail(targetEmail, summary);

  return {
    success: true,
    message: "News generated and emailed successfully!",
    greeting,
    summary,
    sentTo: targetEmail,
  };
}
