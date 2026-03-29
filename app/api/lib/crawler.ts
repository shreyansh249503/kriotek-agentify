import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";
import { getDb } from "./db";
import { CrawledPage } from "./entities";

export async function crawlWebsite(
  startUrl: string,
  publicKey: string,
  maxPages = 40,
): Promise<string> {
  const visited = new Set<string>();
  const queue: string[] = [startUrl];

  let collectedText = "";

  const baseDomain = new URL(startUrl).hostname;

  const agent =
    process.env.NODE_ENV === "development"
      ? new https.Agent({ rejectUnauthorized: false })
      : undefined;

  while (queue.length > 0 && visited.size < maxPages) {
    const url = queue.shift();
    if (!url) continue;

    const db = await getDb();
    const existing = await db.getRepository(CrawledPage).exists({
      where: { bot_public_key: publicKey, page_url: url }
    });

    if (existing) {
      console.log("Already crawled:", url);
      continue;
    }

    if (visited.has(url)) continue;

    try {
      const { data: html } = await axios.get(url, {
        httpsAgent: agent,
        timeout: 15000,
        headers: {
          "User-Agent": "Mozilla/5.0 AgentifyBot",
        },
      });

      visited.add(url);

      const crawledRepo = db.getRepository(CrawledPage);
      const newCrawled = crawledRepo.create({
        bot_public_key: publicKey,
        page_url: url
      });
      await crawledRepo.save(newCrawled);

      const $ = cheerio.load(html);

      $("script, style, noscript").remove();

      let text = $("main").text() || $("article").text() || $("body").text();

      text = text.replace(/\s+/g, " ").trim();

      collectedText += "\n\n" + text;

      $("a").each((_, el) => {
        const href = $(el).attr("href");
        if (!href) return;

        try {
          const absoluteUrl = new URL(href, url).href;
          const hostname = new URL(absoluteUrl).hostname;

          if (hostname === baseDomain && !visited.has(absoluteUrl)) {
            queue.push(absoluteUrl);
          }
        } catch {}
      });
    } catch (err) {
      console.log("Failed:", url);
    }
  }

  return collectedText;
}
