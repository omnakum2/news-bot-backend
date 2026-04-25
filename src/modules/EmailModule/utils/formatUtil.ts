export function buildGreeting(): string {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    `👋 Hello! Here's your Daily News for ${today}.\n` +
    `Below are today's most important stories summarized for quick reading.`
  );
}

function formatSummaryToHTML(summary: string): string {
  if (!summary) return "<p>No news available.</p>";

  const lines = summary.split("\n").filter(l => l.trim());

  let html = "<ul style='padding-left: 20px; margin: 0;'>";

  for (const line of lines) {
    if (line.trim().startsWith("*")) {
      const clean = line.replace(/^\*\s*/, "");

      const formatted = clean
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/→\s*(https?:\/\/[^\s]+)/g, '<br><a href="$1" style="color: #007bff; text-decoration: none; font-size: 13px;">Read Full Article →</a>');

      html += `
        <li style="margin-bottom: 14px; line-height: 1.5;">
          ${formatted}
        </li>
      `;
    }
  }

  html += "</ul>";

  return html;
}

export function generateEmailHTML(
  greeting: string,
  summary: string
): string {
  const formattedSummary = formatSummaryToHTML(summary);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>

    <body style="
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 640px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    ">

      <div style="
        background-color: #ffffff;
        border-radius: 12px;
        padding: 32px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      ">

        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #1a1a1a; font-size: 26px; margin: 0;">
            📰 Daily News
          </h1>

          <p style="color: #666666; font-size: 14px; margin-top: 8px;">
            ${greeting.replace(/\n/g, "<br>")}
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">

        <div style="color: #333333; font-size: 15px;">
          ${formattedSummary}
        </div>

        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">

        <p style="text-align: center; color: #999999; font-size: 12px;">
          Powered by Daily News Bot 🤖
        </p>

      </div>
    </body>
    </html>
  `;
}