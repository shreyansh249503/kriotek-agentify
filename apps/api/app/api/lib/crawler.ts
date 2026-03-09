import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";

export async function crawlWebsite(
  startUrl: string,
  maxPages = 20,
): Promise<string> {
  const visited = new Set<string>();
  const queue: string[] = [startUrl];

  let collectedText = "";

  const agent =
    process.env.NODE_ENV === "development"
      ? new https.Agent({ rejectUnauthorized: false })
      : undefined;

  const baseDomain = new URL(startUrl).hostname;

  while (queue.length > 0 && visited.size < maxPages) {
    const url = queue.shift();
    if (!url) continue;

    if (visited.has(url)) continue;

    try {
      console.log(`Crawling: ${url}`);

      const { data: html } = await axios.get(url, {
        httpsAgent: agent,
        timeout: 15000,
        headers: {
          "User-Agent": `Mozilla/5.0 (compatible; AgentifyBot/1.0)`,
        },
      });

      visited.add(url);

      const $ = cheerio.load(html);

      $("script, style, noscript").remove();

      let text = $("main").text() || $("article").text() || $("body").text();

      text = text.replace(/\s+/g, " ").trim();

      collectedText += "\n\n" + text;

      $("a").each((_, el) => {
        const href = $(el).attr("href");
        if (!href) return;

        if (
          href.startsWith("#") ||
          href.startsWith("mailto:") ||
          href.startsWith("tel:") ||
          href.startsWith("javascript:")
        ) {
          return;
        }

        try {
          const absoluteUrl = new URL(href, url).href;
          const hostname = new URL(absoluteUrl).hostname;

          if (hostname === baseDomain && !visited.has(absoluteUrl)) {
            queue.push(absoluteUrl);
          }
        } catch (error) {
          console.error(`Failed to process ${href}:`, error);
        }
      });

      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Failed to crawl ${url}:`, error);
    }
  }

  console.log("Total pages crawled:", visited.size);

  return collectedText;
}
