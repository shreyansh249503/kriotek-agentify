import { getUserFromRequest } from "../lib/auth";
import { crawlWebsite } from "../lib/crawler";

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
    const key = publicKey || `temp-extract-${user.id}`;
    // Limit page count to 15 to ensure fast extraction for user preview
    const result = await crawlWebsite(url, key, 15, true);

    return Response.json({
      success: true,
      products: result.products,
    });
  } catch (err: unknown) {
    console.error("Error extracting products:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to extract products";
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
