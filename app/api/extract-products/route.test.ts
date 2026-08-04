jest.mock("ai", () => ({
  generateObject: jest.fn(),
}));
jest.mock("@ai-sdk/google", () => ({
  google: jest.fn(),
}));
jest.mock("cheerio", () => ({
  load: jest.fn(),
}));
jest.mock("../lib/auth");
jest.mock("../lib/crawler");

import { POST } from "./route";
import { getUserFromRequest } from "../lib/auth";
import { crawlWebsite } from "../lib/crawler";

describe("API: /api/extract-products", () => {
  const mockUser = { id: "user_123", email: "user@example.com" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    (getUserFromRequest as jest.Mock).mockResolvedValueOnce(null);

    const req = new Request("http://localhost/api/extract-products", {
      method: "POST",
      body: JSON.stringify({ url: "https://example.com" }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data).toEqual({ error: "Unauthorized" });
  });

  it("should return 400 if url is missing in body", async () => {
    (getUserFromRequest as jest.Mock).mockResolvedValueOnce(mockUser);

    const req = new Request("http://localhost/api/extract-products", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({ error: "URL is required" });
  });

  it("should call crawlWebsite with url, key, and extractProducts flag and return products", async () => {
    (getUserFromRequest as jest.Mock).mockResolvedValueOnce(mockUser);

    const mockProducts = [
      { name: "Wireless Earbuds", price: "$49.99", image: "https://example.com/earbuds.jpg" },
    ];

    (crawlWebsite as jest.Mock).mockResolvedValueOnce({
      products: mockProducts,
    });

    const req = new Request("http://localhost/api/extract-products", {
      method: "POST",
      body: JSON.stringify({ url: "https://shop.example.com", publicKey: "pk_123" }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(crawlWebsite).toHaveBeenCalledWith("https://shop.example.com", "pk_123", 15, true);
    expect(data).toEqual({
      success: true,
      products: mockProducts,
    });
  });

  it("should fallback key to temp-extract-userId if publicKey is not supplied", async () => {
    (getUserFromRequest as jest.Mock).mockResolvedValueOnce(mockUser);
    (crawlWebsite as jest.Mock).mockResolvedValueOnce({ products: [] });

    const req = new Request("http://localhost/api/extract-products", {
      method: "POST",
      body: JSON.stringify({ url: "https://shop.example.com" }),
    });

    await POST(req);

    expect(crawlWebsite).toHaveBeenCalledWith("https://shop.example.com", `temp-extract-${mockUser.id}`, 15, true);
  });

  it("should return 500 when crawlWebsite fails", async () => {
    jest.spyOn(console, "error").mockImplementationOnce(() => {});

    (getUserFromRequest as jest.Mock).mockResolvedValueOnce(mockUser);
    (crawlWebsite as jest.Mock).mockRejectedValueOnce(new Error("Network timeout during crawl"));

    const req = new Request("http://localhost/api/extract-products", {
      method: "POST",
      body: JSON.stringify({ url: "https://shop.example.com" }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({ error: "Network timeout during crawl" });
  });
});
