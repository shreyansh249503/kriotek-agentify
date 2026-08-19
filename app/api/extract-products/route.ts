import { getUserFromRequest } from "../lib/auth";
import { crawlWebsite } from "../lib/crawler";
import { Product } from "../../../types/bot";

export function extractUrlsFromString(input: string): string[] {
  if (!input || typeof input !== "string") return [];
  const trimmed = input.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    const subUrls = trimmed.split(/(?=https?:\/\/)/gi);
    if (subUrls.length === 1) {
      return [trimmed];
    }
  }
  const matches = input.match(/https?:\/\/[^\s"'<>\\]+/gi) || [];
  const valid: string[] = [];

  for (const m of matches) {
    const subUrls = m.split(/(?=https?:\/\/)/gi);
    for (const sub of subUrls) {
      const s = sub.trim();
      if (s) valid.push(s);
    }
  }
  return [...new Set(valid)];
}

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { url, publicKey } = await req.json();
  if (!url) {
    return Response.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const urls = extractUrlsFromString(String(url));
    const targetUrls = urls.length > 0 ? urls : [url.trim()];

    const key = publicKey || `temp-extract-${user.id}`;
    const allProducts: Product[] = [];

    let lastError: unknown = null;
    for (const targetUrl of targetUrls.slice(0, 5)) {
      try {
        // Limit page count to 15 to ensure fast extraction for user preview
        const result = await crawlWebsite(targetUrl, key, 15, true);
        if (result.products && result.products.length > 0) {
          for (const prod of result.products) {
            const isDup = allProducts.some(
              (p) =>
                p.name.toLowerCase() === prod.name.toLowerCase() ||
                (p.url && p.url === prod.url),
            );
            if (!isDup) {
              allProducts.push(prod);
            }
          }
        }
      } catch (crawlErr) {
        lastError = crawlErr;
        console.warn(`[extract-products] Error crawling ${targetUrl}:`, crawlErr);
      }
    }

    if (allProducts.length === 0 && lastError && targetUrls.length === 1) {
      throw lastError;
    }

    return Response.json({
      success: true,
      products: allProducts,
    });
  } catch (err: unknown) {
    console.error("Error extracting products:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to extract products";
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
