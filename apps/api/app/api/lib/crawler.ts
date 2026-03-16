import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";
import { db } from "./db";

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

    const existing = await db.query(
      "SELECT id FROM crawled_pages WHERE bot_public_key=$1 AND page_url=$2",
      [publicKey, url],
    );

    if ((existing.rowCount ?? 0) > 0) {
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

      await db.query(
        "INSERT INTO crawled_pages (bot_public_key,page_url) VALUES ($1,$2)",
        [publicKey, url],
      );

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
