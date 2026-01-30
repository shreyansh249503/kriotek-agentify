import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";

export async function crawlWebsite(url: string): Promise<string> {
  const agent =
    process.env.NODE_ENV === "development"
      ? new https.Agent({ rejectUnauthorized: false })
      : undefined;

  const { data: html } = await axios.get(url, {
    httpsAgent: agent,
    timeout: 15000,
    headers: {
      "User-Agent": `Mozilla/5.0 (compatible; AgentifyBot/1.0; +${process.env.CHEERIO_URL})`,
    },
  });

  const $ = cheerio.load(html);

  // Remove only truly useless tags
  $("script, style, noscript").remove();

  // Prefer readable content
  let text = $("main").text() || $("article").text() || $("body").text();

  text = text.replace(/\s+/g, " ").trim();

  return text;
}
