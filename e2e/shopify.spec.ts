import { test, expect } from "@playwright/test";
import {
  mockShopifyAppBridge,
  mockShopifyAPIs,
  MOCK_SHOPIFY_BOT,
  MOCK_CRAWLED_PAGES,
  MOCK_SHOPIFY_LEADS,
} from "./shopify-helpers";

test.describe("Shopify Embedded Admin App Flow", () => {
  // =========================================================================
  // E2E-7.1: App Bridge Initialization & Overview (/admin/shopify)
  // =========================================================================
  test.describe("E2E-7.1: App Bridge Initialization & Overview (/admin/shopify)", () => {
    test("should display unauthorized banner when App Bridge session token exchange fails with 401", async ({
      page,
    }) => {
      await mockShopifyAppBridge(page);
      await mockShopifyAPIs(page, { unauthorized: true });

      await page.goto("/admin/shopify", { waitUntil: "domcontentloaded" });

      const unauthorizedBanner = page.getByText("Shopify App Bridge Required");
      await expect(unauthorizedBanner).toBeVisible({ timeout: 20000 });

      await expect(
        page.getByText(
          /This dashboard can only be accessed within the Shopify Admin portal iframe/i
        )
      ).toBeVisible();
      await expect(page.getByText(/Apps → Agentify/i)).toBeVisible();
    });

    test("should initialize App Bridge handshake, render dashboard metrics cards, and performance trends chart", async ({
      page,
    }) => {
      await mockShopifyAppBridge(page, {
        token: "jwt-session-token-shopify-overview",
      });
      await mockShopifyAPIs(page, {
        stats: {
          total_conversations: 76,
          total_leads: 19,
          products_synced: 30,
        },
      });

      await page.goto("/admin/shopify", { waitUntil: "domcontentloaded" });

      await expect(
        page.getByRole("heading", { name: "Agentify Dashboard" })
      ).toBeVisible({ timeout: 20000 });
      await expect(
        page.getByText("Your AI sales and support assistant")
      ).toBeVisible();

      // Metric stat cards
      const convosBlock = page.getByRole("heading", { name: "Conversations" }).locator("xpath=..");
      await expect(convosBlock).toBeVisible({ timeout: 15000 });
      await expect(convosBlock).toContainText("76");

      const leadsBlock = page.getByRole("heading", { name: "Leads captured" }).locator("xpath=..");
      await expect(leadsBlock).toBeVisible();
      await expect(leadsBlock).toContainText("19");

      const productsBlock = page.getByRole("heading", { name: "Products synced" }).locator("xpath=..");
      await expect(productsBlock).toBeVisible();
      await expect(productsBlock).toContainText("30");

      // Performance trends section
      await expect(page.getByRole("heading", { name: "Performance trends" })).toBeVisible();

      // Bot configuration card
      await expect(
        page.getByRole("heading", { name: "Bot configuration" })
      ).toBeVisible();
      await expect(page.getByText("Active")).toBeVisible();
      await expect(page.getByText(/Name:\s*Shopify Assistant/i)).toBeVisible();
      await expect(page.getByText(/E-commerce:\s*Enabled/i)).toBeVisible();
    });

    test("should navigate to Edit bot sub-route from overview action button", async ({
      page,
    }) => {
      await mockShopifyAppBridge(page);
      await mockShopifyAPIs(page);

      await page.goto("/admin/shopify", { waitUntil: "domcontentloaded" });

      await expect(
        page.getByRole("heading", { name: "Agentify Dashboard" })
      ).toBeVisible({ timeout: 20000 });

      const editBotBtn = page.getByRole("button", { name: "Edit bot" });
      await expect(editBotBtn).toBeVisible({ timeout: 15000 });
      await editBotBtn.click();
      await expect(page).toHaveURL(/\/admin\/shopify\/bot/, { timeout: 15000 });
    });

    test("should navigate to View leads sub-route from overview action button", async ({
      page,
    }) => {
      await mockShopifyAppBridge(page);
      await mockShopifyAPIs(page);

      await page.goto("/admin/shopify", { waitUntil: "domcontentloaded" });

      await expect(
        page.getByRole("heading", { name: "Agentify Dashboard" })
      ).toBeVisible({ timeout: 20000 });

      const viewLeadsBtn = page.getByRole("button", { name: "View leads" });
      await expect(viewLeadsBtn).toBeVisible({ timeout: 15000 });
      await viewLeadsBtn.click();
      await expect(page).toHaveURL(/\/admin\/shopify\/leads/, { timeout: 15000 });
    });

    test("should navigate to Training data sub-route from overview action button", async ({
      page,
    }) => {
      await mockShopifyAppBridge(page);
      await mockShopifyAPIs(page);

      await page.goto("/admin/shopify", { waitUntil: "domcontentloaded" });

      await expect(
        page.getByRole("heading", { name: "Agentify Dashboard" })
      ).toBeVisible({ timeout: 20000 });

      const trainingDataBtn = page.getByRole("button", { name: "Training data" });
      await expect(trainingDataBtn).toBeVisible({ timeout: 15000 });
      await trainingDataBtn.click();
      await expect(page).toHaveURL(/\/admin\/shopify\/training/, { timeout: 15000 });
    });

    test("should trigger product catalog sync from Shopify store and update synced count", async ({
      page,
    }) => {
      let syncPayload: { shop: string; bot_id: string } | null = null;
      await mockShopifyAppBridge(page);
      await mockShopifyAPIs(page, {
        stats: {
          total_conversations: 48,
          total_leads: 3,
          products_synced: 24,
        },
        onSyncProducts: (data) => {
          syncPayload = data;
        },
      });

      await page.goto("/admin/shopify", { waitUntil: "domcontentloaded" });

      await expect(
        page.getByRole("heading", { name: "Agentify Dashboard" })
      ).toBeVisible({ timeout: 20000 });

      const productsBlock = page.getByRole("heading", { name: "Products synced" }).locator("xpath=..");
      await expect(productsBlock).toContainText("24", { timeout: 15000 });

      const syncBtn = page.getByRole("button", { name: "Sync products" });
      await expect(syncBtn).toBeVisible();
      await syncBtn.click();

      const successBanner = page.getByText("Synced 52 products successfully.");
      await expect(successBanner).toBeVisible({ timeout: 10000 });

      expect(syncPayload).not.toBeNull();
      expect((syncPayload as { shop: string; bot_id: string } | null)?.shop).toBe("mystore.myshopify.com");
      expect((syncPayload as { shop: string; bot_id: string } | null)?.bot_id).toBe(MOCK_SHOPIFY_BOT.id);

      // Verify stats refreshed
      await expect(productsBlock).toContainText("52");
    });

    test("should display setup banner when no bot is configured yet", async ({
      page,
    }) => {
      await mockShopifyAppBridge(page);
      await mockShopifyAPIs(page, { bot: null });

      await page.goto("/admin/shopify", { waitUntil: "domcontentloaded" });

      await expect(page.getByText("No bot configured yet")).toBeVisible({
        timeout: 20000,
      });
      await expect(
        page.getByText(
          "Set up your first bot to start capturing leads and recommending products."
        )
      ).toBeVisible();
    });
  });

  // =========================================================================
  // E2E-7.2: Shopify Bot Customization (/admin/shopify/bot)
  // =========================================================================
  test.describe("E2E-7.2: Shopify Bot Customization (/admin/shopify/bot)", () => {
    test("should display unauthorized banner when accessing /admin/shopify/bot without authorization", async ({
      page,
    }) => {
      await mockShopifyAppBridge(page);
      await mockShopifyAPIs(page, { unauthorized: true });

      await page.goto("/admin/shopify/bot", { waitUntil: "domcontentloaded" });

      await expect(
        page.getByText("Shopify App Bridge Required")
      ).toBeVisible({ timeout: 20000 });
    });

    test("should pre-populate bot configuration fields and synchronize with live BotPreview", async ({
      page,
    }) => {
      await mockShopifyAppBridge(page);
      await mockShopifyAPIs(page);

      await page.goto("/admin/shopify/bot", { waitUntil: "domcontentloaded" });

      await expect(
        page.getByRole("heading", { name: "Bot configuration" })
      ).toBeVisible({ timeout: 20000 });

      // Check pre-populated fields
      const publicKeyInput = page.locator('input[value="pk_shopify_test_bot_12345"]');
      await expect(publicKeyInput).toBeVisible();

      const nameInput = page.getByLabel("Bot name");
      await expect(nameInput).toHaveValue("Shopify Assistant");

      const descriptionInput = page.getByLabel("Description");
      await expect(descriptionInput).toHaveValue(
        "AI sales and customer support assistant for Shopify storefront."
      );

      const toneSelect = page.getByLabel("Tone");
      await expect(toneSelect).toHaveValue("friendly");

      const brandColorInput = page.getByLabel("Brand color");
      await expect(brandColorInput).toHaveValue("#6C47FF");

      const leadEmailInput = page.getByLabel("Notification email");
      await expect(leadEmailInput).toHaveValue("support@mystore.com");

      const leadPromptInput = page.getByLabel("Lead capture prompt");
      await expect(leadPromptInput).toHaveValue(
        "Would you like our support team to follow up with you directly?"
      );

      const salesPromptInput = page.getByLabel("Sales prompt");
      await expect(salesPromptInput).toHaveValue(
        "Pitch our best-selling headphones when customers inquire about electronics."
      );

      // Verify BotPreview reflects data
      const previewContainer = page.locator("div").filter({ hasText: /^Live Preview/ }).last();
      await expect(previewContainer).toBeVisible();
      await expect(previewContainer.getByText("Shopify Assistant")).toBeVisible();
      await expect(previewContainer.getByText("Tone: friendly")).toBeVisible();
      await expect(
        previewContainer.getByText("Would you like our support team to follow up with you directly?")
      ).toBeVisible();
    });

    test("should update bot fields (greeting, instructions, brand colors, tone) with real-time preview updates", async ({
      page,
    }) => {
      await mockShopifyAppBridge(page);
      await mockShopifyAPIs(page);

      await page.goto("/admin/shopify/bot", { waitUntil: "domcontentloaded" });

      const previewContainer = page.locator("div").filter({ hasText: /^Live Preview/ }).last();
      await expect(previewContainer).toBeVisible({ timeout: 20000 });

      // Change Bot Name
      const nameInput = page.getByLabel("Bot name");
      await expect(nameInput).toBeVisible();
      await nameInput.fill("Luxe Concierge AI");

      // Verify Live Preview header reflects updated name
      await expect(previewContainer.getByText("Luxe Concierge AI")).toBeVisible();

      // Change Tone
      const toneSelect = page.getByLabel("Tone");
      await toneSelect.selectOption("professional");
      await expect(previewContainer.getByText("Tone: professional")).toBeVisible();

      // Change Brand Color
      const brandColorInput = page.getByLabel("Brand color");
      await brandColorInput.fill("10b981");

      // Update Sales and Lead prompts
      const salesPromptInput = page.getByLabel("Sales prompt");
      await salesPromptInput.fill("Highlight 20% discount on summer apparel collection.");

      const leadPromptInput = page.getByLabel("Lead capture prompt");
      await leadPromptInput.fill("Join our VIP rewards club for exclusive deals!");

      // Verify Live Preview prompt
      await expect(
        previewContainer.getByText("Join our VIP rewards club for exclusive deals!")
      ).toBeVisible();
    });

    test("should handle bot avatar upload and removal with preview synchronization", async ({
      page,
    }) => {
      await mockShopifyAppBridge(page);
      await mockShopifyAPIs(page);

      await page.goto("/admin/shopify/bot", { waitUntil: "domcontentloaded" });

      await expect(page.getByText("Bot Avatar")).toBeVisible({ timeout: 20000 });

      // Set input file in DropZone
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles({
        name: "shopify-avatar.png",
        mimeType: "image/png",
        buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64"),
      });

      // Assert upload success banner
      const uploadSuccessBanner = page.getByText("Logo uploaded successfully.");
      await expect(uploadSuccessBanner).toBeVisible({ timeout: 10000 });

      // Assert Thumbnail and Remove Logo button appear
      const removeLogoBtn = page.getByRole("button", { name: "Remove Logo" });
      await expect(removeLogoBtn).toBeVisible();

      // Click Remove Logo
      await removeLogoBtn.click();
      await expect(removeLogoBtn).not.toBeVisible();
      await expect(page.getByText("Upload logo")).toBeVisible();
    });

    test("should save bot configuration, send PATCH request, and support back navigation", async ({
      page,
    }) => {
      let updatedConfigPayload: unknown = null;
      await mockShopifyAppBridge(page);
      await mockShopifyAPIs(page, {
        onUpdateBot: (data) => {
          updatedConfigPayload = data;
        },
      });

      await page.goto("/admin/shopify/bot", { waitUntil: "domcontentloaded" });

      const nameInput = page.getByLabel("Bot name");
      await expect(nameInput).toBeVisible({ timeout: 20000 });
      await nameInput.fill("Quantum Shopify AI");

      const saveBtn = page.getByRole("button", { name: "Save" });
      await expect(saveBtn).toBeVisible();
      await saveBtn.click();

      const saveSuccessBanner = page.getByText(
        "Bot configuration saved successfully."
      );
      await expect(saveSuccessBanner).toBeVisible({ timeout: 10000 });

      expect(updatedConfigPayload).not.toBeNull();

      // Test back action to Dashboard
      const dashboardBackBtn = page.getByRole("button", { name: "Dashboard" });
      await expect(dashboardBackBtn).toBeVisible();
      await dashboardBackBtn.click();

      await expect(page).toHaveURL(/\/admin\/shopify$/, { timeout: 15000 });
    });
  });

  // =========================================================================
  // E2E-7.3: Product Catalog & Policy Ingestion (/admin/shopify/training)
  // =========================================================================
  test.describe("E2E-7.3: Product Catalog & Policy Ingestion (/admin/shopify/training)", () => {
    test("should display unauthorized banner when unauthorized on /admin/shopify/training", async ({
      page,
    }) => {
      await mockShopifyAppBridge(page);
      await mockShopifyAPIs(page, { unauthorized: true });

      await page.goto("/admin/shopify/training", {
        waitUntil: "domcontentloaded",
      });

      await expect(
        page.getByText("Shopify App Bridge Required")
      ).toBeVisible({ timeout: 20000 });
    });

    test("should display existing crawled store policy and knowledge pages", async ({
      page,
    }) => {
      await mockShopifyAppBridge(page);
      await mockShopifyAPIs(page);

      await page.goto("/admin/shopify/training", {
        waitUntil: "domcontentloaded",
      });

      await expect(
        page.getByRole("heading", { name: "Training data" })
      ).toBeVisible({ timeout: 20000 });

      // Check Crawled Pages badge and links
      await expect(page.getByText("3 active page(s)")).toBeVisible();
      await expect(
        page.getByText("https://mystore.myshopify.com/policies/shipping-policy")
      ).toBeVisible();
      await expect(
        page.getByText("https://mystore.myshopify.com/policies/refund-policy")
      ).toBeVisible();
      await expect(
        page.getByText("https://mystore.myshopify.com/policies/terms-of-service")
      ).toBeVisible();
    });

    test("should crawl and ingest new store policy or FAQ webpage URL", async ({
      page,
    }) => {
      let crawledUrl: string | null = null;
      await mockShopifyAppBridge(page);
      await mockShopifyAPIs(page, {
        onIngestUrl: (url) => {
          crawledUrl = url;
        },
      });

      await page.goto("/admin/shopify/training", {
        waitUntil: "domcontentloaded",
      });

      const urlInput = page.getByPlaceholder("https://example.com/about");
      await expect(urlInput).toBeVisible({ timeout: 20000 });

      const newPolicyUrl = "https://mystore.myshopify.com/pages/faq";
      await urlInput.fill(newPolicyUrl);

      const crawlBtn = page.getByRole("button", { name: "Crawl URL" });
      await expect(crawlBtn).toBeEnabled();
      await crawlBtn.click();

      const successBanner = page.getByText(
        "Crawled website successfully (indexed 12 content chunks)."
      );
      await expect(successBanner).toBeVisible({ timeout: 10000 });

      expect(crawledUrl).toBe(newPolicyUrl);

      // Verify input reset and badge updated
      await expect(urlInput).toHaveValue("");
      await expect(page.getByText("4 active page(s)")).toBeVisible();
      await expect(page.getByText(newPolicyUrl)).toBeVisible();
    });

    test("should display notification when attempting to crawl duplicate policy URL", async ({
      page,
    }) => {
      await mockShopifyAppBridge(page);
      await mockShopifyAPIs(page);

      await page.goto("/admin/shopify/training", {
        waitUntil: "domcontentloaded",
      });

      const urlInput = page.getByPlaceholder("https://example.com/about");
      await expect(urlInput).toBeVisible({ timeout: 20000 });

      // Enter existing policy URL
      await urlInput.fill(MOCK_CRAWLED_PAGES[0].page_url);

      const crawlBtn = page.getByRole("button", { name: "Crawl URL" });
      await crawlBtn.click();

      const duplicateBanner = page.getByText("This URL was already crawled.");
      await expect(duplicateBanner).toBeVisible({ timeout: 10000 });
    });

    test("should upload and ingest policy PDF document", async ({ page }) => {
      let pdfUploaded = false;
      await mockShopifyAppBridge(page);
      await mockShopifyAPIs(page, {
        onIngestPdf: () => {
          pdfUploaded = true;
        },
      });

      await page.goto("/admin/shopify/training", {
        waitUntil: "domcontentloaded",
      });

      await expect(page.getByText("Upload PDF Document")).toBeVisible({
        timeout: 20000,
      });

      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles({
        name: "shipping-policy-2026.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from("%PDF-1.4 mock pdf content"),
      });

      await expect(page.getByText("shipping-policy-2026.pdf")).toBeVisible();

      const uploadPdfBtn = page.getByRole("button", { name: "Upload PDF" });
      await expect(uploadPdfBtn).toBeVisible();
      await uploadPdfBtn.click();

      const successBanner = page.getByText(
        '"shipping-policy-2026.pdf" uploaded and indexed successfully (8 chunks).'
      );
      await expect(successBanner).toBeVisible({ timeout: 10000 });
      expect(pdfUploaded).toBe(true);
    });
  });

  // =========================================================================
  // E2E-7.4: Shopify Leads Management (/admin/shopify/leads)
  // =========================================================================
  test.describe("E2E-7.4: Shopify Leads Management (/admin/shopify/leads)", () => {
    test("should display unauthorized banner when unauthorized on /admin/shopify/leads", async ({
      page,
    }) => {
      await mockShopifyAppBridge(page);
      await mockShopifyAPIs(page, { unauthorized: true });

      await page.goto("/admin/shopify/leads", {
        waitUntil: "domcontentloaded",
      });

      await expect(
        page.getByText("Shopify App Bridge Required")
      ).toBeVisible({ timeout: 20000 });
    });

    test("should display empty state when no storefront leads have been captured", async ({
      page,
    }) => {
      await mockShopifyAppBridge(page);
      await mockShopifyAPIs(page, { leads: [] });

      await page.goto("/admin/shopify/leads", {
        waitUntil: "domcontentloaded",
      });

      await expect(page.getByRole("heading", { name: "Leads" })).toBeVisible({
        timeout: 20000,
      });
      await expect(page.getByText("No leads yet")).toBeVisible();
      await expect(
        page.getByText(
          "Leads will appear here once customers share their contact details with your chatbot."
        )
      ).toBeVisible();

      const configBotBtn = page.getByRole("button", {
        name: "Configure Bot Settings",
      });
      await expect(configBotBtn).toBeVisible();
      await configBotBtn.click();
      await expect(page).toHaveURL(/\/admin\/shopify\/bot/, { timeout: 15000 });
    });

    test("should render table of captured storefront leads with customer details and purchase contact data", async ({
      page,
    }) => {
      await mockShopifyAppBridge(page);
      await mockShopifyAPIs(page, { leads: MOCK_SHOPIFY_LEADS });

      await page.goto("/admin/shopify/leads", {
        waitUntil: "domcontentloaded",
      });

      await expect(page.getByText("3 leads captured")).toBeVisible({
        timeout: 20000,
      });

      // DataTable table headings
      const table = page.locator("table");
      await expect(table).toBeVisible();
      await expect(table.getByText("Name")).toBeVisible();
      await expect(table.getByText("Email")).toBeVisible();
      await expect(table.getByText("Phone")).toBeVisible();
      await expect(table.getByText("Date")).toBeVisible();

      // Row data assertions
      await expect(page.getByText("Emily Watson")).toBeVisible();
      await expect(page.getByText("emily.watson@example.com")).toBeVisible();
      await expect(page.getByText("+1 (555) 345-6789")).toBeVisible();

      await expect(page.getByText("Alexander Hayes")).toBeVisible();
      await expect(page.getByText("alex.hayes@example.com")).toBeVisible();
      await expect(page.getByText("+1 (555) 789-0123")).toBeVisible();

      await expect(page.getByText("Sophia Taylor")).toBeVisible();
      await expect(page.getByText("sophia.t@example.com")).toBeVisible();
    });

    test("should export leads to CSV file and verify downloaded contents", async ({
      page,
    }) => {
      await mockShopifyAppBridge(page);
      await mockShopifyAPIs(page, { leads: MOCK_SHOPIFY_LEADS });

      await page.goto("/admin/shopify/leads", {
        waitUntil: "domcontentloaded",
      });

      const exportCsvBtn = page.getByRole("button", { name: "Export CSV" });
      await expect(exportCsvBtn).toBeVisible({ timeout: 20000 });

      const downloadPromise = page.waitForEvent("download");
      await exportCsvBtn.click();
      const download = await downloadPromise;

      expect(download.suggestedFilename()).toBe("agentify-leads.csv");

      const stream = await download.createReadStream();
      expect(stream).not.toBeNull();

      if (stream) {
        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
        const csvText = Buffer.concat(chunks).toString("utf-8");

        // Verify CSV header line
        expect(csvText).toMatch(/"?Name"?,.*"?Email"?,.*"?Phone"?,.*"?Date"?/);

        // Verify CSV records
        expect(csvText).toContain("Emily Watson");
        expect(csvText).toContain("emily.watson@example.com");
        expect(csvText).toContain("+1 (555) 345-6789");

        expect(csvText).toContain("Alexander Hayes");
        expect(csvText).toContain("alex.hayes@example.com");
        expect(csvText).toContain("+1 (555) 789-0123");

        expect(csvText).toContain("Sophia Taylor");
        expect(csvText).toContain("sophia.t@example.com");
      }
    });
  });
});
