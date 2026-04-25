import { sendEmail } from "./EmailService";
import { generateEmailHTML, buildGreeting } from "./utils/formatUtil";
import type { SummarizationResult } from "../AIModule/AiService";

export async function sendNewsEmail(
  recipientEmail: string,
  summary: SummarizationResult
): Promise<string> {
  const greeting = buildGreeting();
  const htmlBody = generateEmailHTML(greeting, summary);

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const subject = `📰 Your Daily News — ${today}`;

  await sendEmail(recipientEmail, subject, htmlBody);

  return greeting;
}
