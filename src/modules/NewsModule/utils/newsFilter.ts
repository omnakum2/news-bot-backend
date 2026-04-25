import { Article } from "../NewsService";

export function filterRecentNews(articles: Article[]): Article[] {
  const now = new Date();

  const thresholdDate = new Date(now);
  thresholdDate.setDate(now.getDate() - 1);
  thresholdDate.setHours(12, 0, 0, 0);

  return articles.filter(article => {
    if (!article.pubDate) return false;

    const pubDateStr = article.pubDate.replace(" ", "T") + "Z";
    const articleDate = new Date(pubDateStr);

    if (isNaN(articleDate.getTime())) return false;

    return articleDate >= thresholdDate;
  });
}
