// ─── Email Module: EmailService.ts ──────────────────────────────────────────
// Handles SMTP transport configuration and email sending via Nodemailer.

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import type { SummarizationResult } from "../AIModule/AiService";

let transporter: Transporter | null = null;

/**
 * Creates or returns cached Nodemailer SMTP transporter (Gmail).
 */
function getTransporter(): Transporter {
  if (!transporter) {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      throw new Error(
        "EMAIL_USER and EMAIL_PASS must be set in environment variables."
      );
    }

    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  }

  return transporter;
}

/**
 * Builds a greeting message with today's date.
 */
export function buildGreeting(): string {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    `👋 Hello! Here's your Daily News for ${today}.\n` +
    `Below are the top stories across Movies, Share Market, and Technology — summarized for quick reading.`
  );
}

/**
 * Builds a styled HTML email body from the summarization result.
 */
export function buildEmailHtml(
  greeting: string,
  summary: SummarizationResult
): string {
  const categoryColors: Record<string, string> = {
    Movies: "#E50914",
    "Share Market": "#00C853",
    Technology: "#2979FF",
  };

  const categorySections = summary.categories
    .map((cat) => {
      const color = categoryColors[cat.name] || "#333333";
      const bulletItems = cat.bullets
        .map(
          (bullet) =>
            `<li style="margin-bottom: 8px; line-height: 1.5; color: #333333;">${bullet}</li>`
        )
        .join("");

      return `
        <div style="margin-bottom: 24px;">
          <h2 style="color: ${color}; font-size: 20px; margin-bottom: 12px; border-bottom: 2px solid ${color}; padding-bottom: 6px;">
            ${cat.name}
          </h2>
          <ul style="padding-left: 20px; margin: 0;">
            ${bulletItems}
          </ul>
        </div>
      `;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background-color: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #1a1a1a; font-size: 26px; margin: 0;">📰 Daily News</h1>
          <p style="color: #666666; font-size: 14px; margin-top: 8px;">
            ${greeting.replace(/\n/g, "<br>")}
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">

        <!-- Categories -->
        ${categorySections}

        <!-- Footer -->
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="text-align: center; color: #999999; font-size: 12px;">
          Powered by News Bot 🤖 | Summarized with AI
        </p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Sends an email with the news.
 */
export async function sendEmail(
  to: string,
  subject: string,
  htmlBody: string
): Promise<void> {
  const transport = getTransporter();

  await transport.sendMail({
    from: `"News Bot 📰" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: htmlBody,
  });
}
