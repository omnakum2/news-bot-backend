import { Article } from "../../NewsModule/NewsService";

export const AI_PROMPT = `
Pick 3-5 most important news items.

Rules:
- Focus strictly on:
  1. AI / tech impact globally
  2. IPL cricket in India
- Ignore minor or repetitive news
- Verify facts briefly using provided text

Output:
- Exactly 3-5 bullets
- Each bullet format: * **[Short Title]** [1-line explanation] → [Source Link]

If absolutely nothing qualifies: NO_IMPORTANT_NEWS
`;

export function buildUserPrompt(articles: Article[]): string {
  if (articles.length === 0) {
    return "News:\nNo articles available.";
  }

  const articleText = articles
    .map(
      (article, index) =>
        `${index + 1}. Title: ${article.title}\n   Description: ${article.description || "N/A"}\n   Link: ${article.link}`
    )
    .join("\n");

  return `News:\n${articleText}`;
}