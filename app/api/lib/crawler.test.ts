import axios from "axios";
import { getDb } from "./db";

jest.mock("axios");
jest.mock("./db");
jest.mock("ai", () => ({
  generateObject: jest.fn().mockResolvedValue({
    object: { isProduct: false },
  }),
}));
jest.mock("@ai-sdk/google", () => ({
  google: jest.fn(),
}));

jest.mock("cheerio", () => {
  return {
    load: (html: string) => {
      const $ = (selector: string | Record<string, unknown>) => {
        if (typeof selector === "string") {
          if (selector === "script[type='application/ld+json']") {
            return {
              each: (cb: (idx: number, el: Record<string, unknown>) => void) => {
                if (html.includes("application/ld+json")) {
                  cb(0, { isJsonLd: true });
                }
              },
            };
          }
          if (selector === "script, style, noscript") {
            return { remove: jest.fn() };
          }
          if (selector === "main" || selector === "article" || selector === "body") {
            return {
              text: () => "Welcome to Acme Store We sell great quality electronics and appliances.",
            };
          }
          if (selector === "img" || selector === "a") {
            return { each: jest.fn() };
          }
          return {
            attr: () => "",
            text: () => "",
          };
        }

        if (selector && typeof selector === "object" && selector.isJsonLd) {
          return {
            html: () =>
              JSON.stringify({
                "@type": "Product",
                "name": "Acme Wireless Headphones",
                "offers": {
                  "price": "99.99",
                  "priceCurrency": "USD",
                },
                "image": "https://acme.example.com/headphones.jpg",
                "description": "High fidelity wireless bluetooth headphones",
              }),
          };
        }

        return {
          html: () => "",
          attr: () => "",
          text: () => "",
        };
      };
      return $;
    },
  };
});

// Import after cheerio mock
import { crawlWebsite } from "./crawler";

describe("crawlWebsite", () => {
  const mockRepo = {
    exists: jest.fn(),
    create: jest.fn().mockImplementation((val) => val),
    save: jest.fn().mockResolvedValue(true),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    (getDb as jest.Mock).mockResolvedValue({
      getRepository: jest.fn().mockReturnValue(mockRepo),
    });
    mockRepo.exists.mockResolvedValue(false);
  });

  it("should crawl pages up to maxPages limit and collect text content", async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: `
        <html>
          <body>
            <main>
              <h1>Welcome to Acme Store</h1>
              <p>We sell great quality electronics and appliances.</p>
            </main>
          </body>
        </html>
      `,
    });

    const result = await crawlWebsite("https://acme.example.com", "pk_123", 1, false);

    expect(axios.get).toHaveBeenCalledWith(
      "https://acme.example.com",
      expect.objectContaining({
        headers: { "User-Agent": "Mozilla/5.0 AgentifyBot" },
      })
    );
    expect(result.collectedText).toContain("Welcome to Acme Store We sell great quality electronics and appliances.");
    expect(mockRepo.save).toHaveBeenCalled();
  });

  it("should extract products from JSON-LD when extractProducts is true", async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: `
        <html>
          <head>
            <script type="application/ld+json">
              {
                "@type": "Product",
                "name": "Acme Wireless Headphones",
                "offers": {
                  "price": "99.99",
                  "priceCurrency": "USD"
                },
                "image": "https://acme.example.com/headphones.jpg",
                "description": "High fidelity wireless bluetooth headphones"
              }
            </script>
          </head>
          <body>
            <main>
              <h1>Acme Wireless Headphones</h1>
            </main>
          </body>
        </html>
      `,
    });

    const result = await crawlWebsite("https://acme.example.com/product/headphones", "pk_123", 1, true);

    expect(result.products).toHaveLength(1);
    expect(result.products[0]).toEqual({
      name: "Acme Wireless Headphones",
      price: "99.99 USD",
      image: "https://acme.example.com/headphones.jpg",
      url: "https://acme.example.com/product/headphones",
      description: "High fidelity wireless bluetooth headphones",
    });
  });

  it("should skip crawling when URL has already been recorded in database", async () => {
    mockRepo.exists.mockResolvedValueOnce(true);

    const result = await crawlWebsite("https://acme.example.com/already-crawled", "pk_123", 1, false);

    expect(axios.get).not.toHaveBeenCalled();
    expect(result.collectedText).toBe("");
  });
});
