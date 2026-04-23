// ─── Email Module: EmailController.ts ───────────────────────────────────────
// Controller wrapper for email operations.

import { sendEmail, buildEmailHtml, buildGreeting } from "./EmailService";
import type { SummarizationResult } from "../AIModule/AiService";

/**
 * Orchestrates building and sending the news email.
 * Returns the greeting used in the email.
 */
export async function sendNewsEmail(
  recipientEmail: string,
  summary: SummarizationResult
): Promise < string > {
  console.log(`📧 Sending news email to: ${recipientEmail}...`);

  const greeting = buildGreeting();
  const htmlBody = buildEmailHtml(greeting, summary);

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const subject = `📰 Your Daily News — ${today}`;

  await sendEmail(recipientEmail, subject, htmlBody);

  console.log(`  ✅ Email sent successfully!`);

  return greeting;
}
