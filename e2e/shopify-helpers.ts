import { Page, BrowserContext } from "@playwright/test";
import { BotConfig } from "@/app/(auth)/admin/shopify/bot/type";

export interface ShopifyLead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

export interface CrawledPageItem {
  id: string;
  page_url: string;
}

export const MOCK_SHOPIFY_BOT: BotConfig = {
  id: "b-shopify-1111-2222-3333-444455556666",
  public_key: "pk_shopify_test_bot_12345",
  name: "Shopify Assistant",
  description: "AI sales and customer support assistant for Shopify storefront.",
  tone: "friendly",
  primary_color: "#6C47FF",
  logo_url: "",
  contact_enabled: true,
  contact_email: "support@mystore.com",
  contact_prompt: "Would you like our support team to follow up with you directly?",
  ecommerce_enabled: true,
  ecommerce_prompt: "Pitch our best-selling headphones when customers inquire about electronics.",
};

export const MOCK_CRAWLED_PAGES: CrawledPageItem[] = [
  {
    id: "page-1",
    page_url: "https://mystore.myshopify.com/policies/shipping-policy",
  },
  {
    id: "page-2",
    page_url: "https://mystore.myshopify.com/policies/refund-policy",
  },
  {
    id: "page-3",
    page_url: "https://mystore.myshopify.com/policies/terms-of-service",
  },
];

export const MOCK_SHOPIFY_LEADS: ShopifyLead[] = [
  {
    id: "lead-shop-001",
    name: "Emily Watson",
    email: "emily.watson@example.com",
    phone: "+1 (555) 345-6789",
    created_at: "2026-08-12T14:30:00.000Z",
  },
  {
    id: "lead-shop-002",
    name: "Alexander Hayes",
    email: "alex.hayes@example.com",
    phone: "+1 (555) 789-0123",
    created_at: "2026-08-10T10:15:00.000Z",
  },
  {
    id: "lead-shop-003",
    name: "Sophia Taylor",
    email: "sophia.t@example.com",
    phone: null,
    created_at: "2026-08-08T18:45:00.000Z",
  },
];

export async function mockShopifyAppBridge(
  target: Page | BrowserContext,
  options?: {
    token?: string;
    throwError?: boolean;
    uninitialized?: boolean;
  }
) {
  if (options?.uninitialized) return;

  await target.addInitScript(
    ({ token, throwError }: { token: string; throwError: boolean }) => {
      window.shopify = {
        idToken: () => {
          if (throwError) {
            return Promise.reject(new Error("Shopify App Bridge session error"));
          }
          return Promise.resolve(token);
        },
      };
    },
    {
      token: options?.token || "mock-shopify-app-bridge-jwt-token",
      throwError: !!options?.throwError,
    }
  );
}

export interface MockShopifyAPIOptions {
  unauthorized?: boolean;
  bot?: Partial<BotConfig> | null;
  crawledPages?: CrawledPageItem[];
  leads?: ShopifyLead[];
  stats?: {
    total_conversations: number;
    total_leads: number;
    products_synced: number;
  };
  trend?: {
    month: string;
    conversations: number;
    leads: number;
  }[];
  shop?: string;
  onUpdateBot?: (data: Partial<BotConfig>) => void;
  onSyncProducts?: (data: { shop: string; bot_id: string }) => void;
  onIngestUrl?: (url: string) => void;
  onIngestPdf?: (formData: unknown) => void;
}

export async function mockShopifyAPIs(
  page: Page | BrowserContext,
  options?: MockShopifyAPIOptions
) {
  let currentBot: BotConfig | null =
    options?.bot === null
      ? null
      : { ...MOCK_SHOPIFY_BOT, ...(options?.bot || {}) };

  const currentCrawledPages: CrawledPageItem[] = [
    ...(options?.crawledPages ?? MOCK_CRAWLED_PAGES),
  ];

  const currentLeads: ShopifyLead[] = [
    ...(options?.leads ?? MOCK_SHOPIFY_LEADS),
  ];

  const shopDomain = options?.shop || "mystore.myshopify.com";

  let productsSyncedCount =
    options?.stats?.products_synced ?? (currentBot ? 24 : 0);

  // 1x1 Pixel for image avatars and thumbnails
  const pngPixel = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64"
  );

  await page.route(
    /(mock-avatar\.png|uploaded-avatar\.png|emptystate-files\.png|shopify-avatar\.png|\/images\/.*\.jpg|\/images\/.*\.png)/,
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "image/png",
        body: pngPixel,
      });
    }
  );

  // Dashboard API
  await page.route("**/api/shopify/admin/dashboard*", async (route) => {
    if (options?.unauthorized) {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "Unauthorized" }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        bot: currentBot
          ? {
              id: currentBot.id,
              name: currentBot.name,
              ecommerce_enabled: currentBot.ecommerce_enabled,
              ecommerce_products: Array.from(
                { length: productsSyncedCount },
                (_, i) => ({
                  shopify_id: `prod-${i + 1}`,
                  name: `Product ${i + 1}`,
                  description: `Description ${i + 1}`,
                  price: 49.99 + i,
                  currency: "USD",
                  image_url: null,
                  url: `https://${shopDomain}/products/item-${i + 1}`,
                  available: true,
                })
              ),
            }
          : null,
        stats: {
          total_conversations: options?.stats?.total_conversations ?? 48,
          total_leads: options?.stats?.total_leads ?? currentLeads.length,
          products_synced: productsSyncedCount,
        },
        trend: options?.trend ?? [
          { month: "Jun 26", conversations: 18, leads: 4 },
          { month: "Jul 26", conversations: 32, leads: 9 },
          { month: "Aug 26", conversations: 48, leads: currentLeads.length },
        ],
        shop: shopDomain,
      }),
    });
  });

  // Bot Config API
  await page.route("**/api/shopify/admin/bot*", async (route) => {
    if (options?.unauthorized) {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "Unauthorized" }),
      });
      return;
    }

    if (route.request().method() === "PATCH") {
      const patchData = route.request().postDataJSON() || {};
      if (currentBot) {
        currentBot = { ...currentBot, ...patchData };
      }
      if (options?.onUpdateBot) {
        options.onUpdateBot(patchData);
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, bot: currentBot }),
      });
    } else {
      if (!currentBot) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ bot: null, crawled_pages: [] }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          bot: currentBot,
          crawled_pages: currentCrawledPages,
        }),
      });
    }
  });

  // Product Sync API
  await page.route("**/api/shopify/sync*", async (route) => {
    const postData = route.request().postDataJSON() || {};
    if (options?.onSyncProducts) {
      options.onSyncProducts(postData);
    }
    productsSyncedCount = 52;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        synced: 52,
      }),
    });
  });

  // URL Crawl API
  await page.route("**/api/shopify/admin/ingest-url*", async (route) => {
    if (options?.unauthorized) {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "Unauthorized" }),
      });
      return;
    }

    const { url } = route.request().postDataJSON() || {};
    if (options?.onIngestUrl) {
      options.onIngestUrl(url);
    }

    const alreadyCrawled = currentCrawledPages.some((p) => p.page_url === url);
    if (alreadyCrawled) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          alreadyCrawled: true,
          message: "This URL has already been crawled",
        }),
      });
      return;
    }

    const newPage = {
      id: `page-${Date.now()}`,
      page_url: url,
    };
    currentCrawledPages.push(newPage);

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        chunksIngested: 12,
      }),
    });
  });

  // PDF Ingestion API
  await page.route("**/api/ingest-pdf*", async (route) => {
    if (options?.onIngestPdf) {
      options.onIngestPdf(route.request().postData());
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: "ok",
        chunks: 8,
      }),
    });
  });

  // Logo / Avatar Upload API
  await page.route("**/api/upload*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        url: "https://bhyrxyzokssibgeznojo.supabase.co/storage/v1/object/public/logos/uploaded-avatar.png",
      }),
    });
  });

  // Leads API
  await page.route("**/api/shopify/admin/leads*", async (route) => {
    if (options?.unauthorized) {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "Unauthorized" }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        leads: currentLeads,
      }),
    });
  });
}
