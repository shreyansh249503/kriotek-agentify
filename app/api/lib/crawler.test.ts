import axios from "axios";
import { getDb } from "./db";
import { isPrivateIp, isSafePublicUrl } from "./crawler";

jest.mock("axios");
jest.mock("./db");
jest.mock("dns/promises", () => ({
  lookup: jest.fn().mockImplementation((hostname: string) => {
    if (hostname.includes("169.254") || hostname.includes("internal")) {
      return Promise.resolve([{ address: "169.254.169.254", family: 4 }]);
    }
    return Promise.resolve([{ address: "93.184.216.34", family: 4 }]);
  }),
}));
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
      type MockData = {
        text?: string;
        html?: string;
        items?: unknown[];
        isJsonLd?: boolean;
        [key: string]: unknown;
      };

      interface MockElement {
        attr: (name: string) => unknown;
        text: () => string;
        html: () => string;
        each: (cb: (idx: number, el: unknown) => void) => void;
        find: () => MockElement;
        first: () => MockElement;
        remove: jest.Mock;
      }

      const createNode = (data?: MockData): MockElement => {
        const node: MockElement = {
          attr: (name: string) => (data && data[name] ? data[name] : ""),
          text: () => (data && typeof data.text === "string" ? data.text : ""),
          html: () => (data && typeof data.html === "string" ? data.html : ""),
          each: (cb: (idx: number, el: unknown) => void) => {
            if (data && Array.isArray(data.items)) {
              data.items.forEach((item, idx) => cb(idx, item));
            }
          },
          find: () => node,
          first: () => node,
          remove: jest.fn(),
        };
        return node;
      };

      const $ = (selector: string | MockData) => {
        if (typeof selector === "string") {
          if (selector === "script[type='application/ld+json']") {
            return createNode({
              items: html.includes("application/ld+json")
                ? [{ isJsonLd: true }]
                : [],
            });
          }
          if (selector === "script, style, noscript") {
            return createNode();
          }
          if (selector === "main" || selector === "article" || selector === "body") {
            return createNode({
              text: "Welcome to Acme Store We sell great quality electronics and appliances.",
            });
          }
          return createNode();
        }

        if (selector && typeof selector === "object" && selector.isJsonLd) {
          return createNode({
            html: JSON.stringify({
              "@type": "Product",
              name: "Acme Wireless Headphones",
              offers: {
                price: "99.99",
                priceCurrency: "USD",
              },
              image: "https://acme.example.com/headphones.jpg",
              description: "High fidelity wireless bluetooth headphones",
            }),
          });
        }

        return createNode();
      };

      return $;
    },
  };
});

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
        headers: expect.objectContaining({
          "User-Agent": expect.stringContaining("Mozilla/5.0"),
        }),
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
    expect(result.products[0]).toMatchObject({
      name: "Acme Wireless Headphones",
      price: "$99.99",
      image: "https://acme.example.com/headphones.jpg",
      url: "https://acme.example.com/product/headphones",
      description: "High fidelity wireless bluetooth headphones",
    });
    expect(result.products[0].metadata).toBeDefined();
  });

  it("should skip crawling when URL has already been recorded in database", async () => {
    mockRepo.exists.mockResolvedValueOnce(true);

    const result = await crawlWebsite("https://acme.example.com/already-crawled", "pk_123", 1, false);

    expect(axios.get).not.toHaveBeenCalled();
    expect(result.collectedText).toBe("");
  });

  describe("SSRF Protection", () => {
    it("should accurately identify private and loopback IP addresses", () => {
      expect(isPrivateIp("127.0.0.1")).toBe(true);
      expect(isPrivateIp("169.254.169.254")).toBe(true);
      expect(isPrivateIp("10.0.0.5")).toBe(true);
      expect(isPrivateIp("192.168.1.1")).toBe(true);
      expect(isPrivateIp("172.16.0.1")).toBe(true);
      expect(isPrivateIp("::1")).toBe(true);
      expect(isPrivateIp("93.184.216.34")).toBe(false);
      expect(isPrivateIp("8.8.8.8")).toBe(false);
    });

    it("should reject unsafe internal hosts and cloud metadata URLs", async () => {
      expect(await isSafePublicUrl("http://169.254.169.254/latest/meta-data")).toBe(false);
      expect(await isSafePublicUrl("http://localhost:3000")).toBe(false);
      expect(await isSafePublicUrl("http://sub.internal")).toBe(false);
      expect(await isSafePublicUrl("ftp://example.com")).toBe(false);
      expect(await isSafePublicUrl("https://example.com")).toBe(true);
    });

    it("should refuse to crawl unsafe start URLs", async () => {
      const result = await crawlWebsite("http://169.254.169.254/latest/meta-data", "pk_123", 1, false);
      expect(axios.get).not.toHaveBeenCalled();
      expect(result.collectedText).toBe("");
      expect(result.products).toEqual([]);
    });
  });
});
