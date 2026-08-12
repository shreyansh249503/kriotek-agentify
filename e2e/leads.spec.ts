import { test, expect } from "@playwright/test";
import {
  mockBotAPIs,
  MOCK_BOT,
  setSessionViaInitScript,
  MockLead,
} from "./bot-helpers";
import { mockSupabaseAuth } from "./auth-helpers";
import { Bot } from "@/types/bot";

test.describe("Leads Management Flow", () => {
  test.beforeEach(async ({ page }) => {
    await setSessionViaInitScript(page);
    await mockSupabaseAuth(page);
  });

  test.describe("E2E-4.3: Leads Management (/admin/leads)", () => {
    const LEADS_BOT: Bot = {
      ...MOCK_BOT,
      id: "b7777777-3333-4444-5555-666666666666",
      public_key: "pk_leads_bot_999",
      name: "Omni Concierge AI",
      contact_enabled: true,
      contact_prompt: "Please provide your name and email to proceed.",
    };

    test("Confirm newly captured customer contacts appear in leads table", async ({
      page,
    }) => {
      const sharedLeads: MockLead[] = [
        {
          id: "lead-1",
          bot_id: LEADS_BOT.id,
          bot_name: LEADS_BOT.name,
          name: "Existing Customer",
          email: "existing@example.com",
          phone: "+1 (555) 111-2222",
          created_at: "2026-08-01T10:00:00.000Z",
        },
      ];

      // 1. Setup API mocks with dynamic leads store
      await mockBotAPIs(page, {
        bot: LEADS_BOT,
        botsList: [LEADS_BOT],
        sharedLeadsStore: sharedLeads,
        chatResponses: [
          "Thank you Marcus! We have saved your contact details.",
        ],
        onChatMessage: ({ message }) => {
          if (message.toLowerCase().includes("marcus")) {
            sharedLeads.unshift({
              id: "lead-new-marcus",
              bot_id: LEADS_BOT.id,
              bot_name: LEADS_BOT.name,
              name: "Marcus Vance",
              email: "marcus.vance@example.com",
              phone: "+1 (555) 444-9876",
              created_at: new Date().toISOString(),
            });
          }
        },
      });

      // 2. Open customer demo playground and submit contact information
      await page.goto(`/demo?botId=${LEADS_BOT.id}`, {
        waitUntil: "domcontentloaded",
      });

      const launcherBtn = page
        .locator("button")
        .filter({ has: page.locator('img[alt="chat"]') })
        .first();
      await expect(launcherBtn).toBeVisible({ timeout: 20000 });

      const widgetContainer = page.locator("#ai-widget").last();
      await launcherBtn.click({ force: true });
      await expect(widgetContainer).toHaveCSS("display", "flex", {
        timeout: 15000,
      });

      const chatInput = widgetContainer.locator("#ai-input");
      const sendButton = widgetContainer.locator("#bot-send-btn");
      const messagesContainer = widgetContainer.locator("#ai-messages");

      await expect(chatInput).toBeVisible({ timeout: 15000 });
      await expect(sendButton).toBeVisible({ timeout: 15000 });

      // Customer sends contact information
      await chatInput.fill(
        "Hi, my name is Marcus Vance and my email is marcus.vance@example.com",
      );
      await sendButton.click();

      // Verify confirmation in chat
      await expect(
        messagesContainer.getByText(
          /Thank you Marcus! We have saved your contact details./i,
        ),
      ).toBeVisible({ timeout: 15000 });

      // 3. Admin visits /admin/leads
      await page.goto("/admin/leads", { waitUntil: "domcontentloaded" });

      // Verify leads table is displayed
      const leadsTable = page.getByTestId("leads-table");
      await expect(leadsTable).toBeVisible({ timeout: 15000 });

      // Verify newly captured contact appears with correct details
      const marcusRow = page
        .getByTestId("lead-row")
        .filter({ hasText: "Marcus Vance" });
      await expect(marcusRow).toBeVisible({ timeout: 10000 });
      await expect(marcusRow.getByTestId("lead-email")).toContainText(
        "marcus.vance@example.com",
      );
      await expect(marcusRow.getByTestId("lead-bot")).toContainText(
        "Omni Concierge AI",
      );
    });

    test("Test lead search filter with dynamic matching and empty state", async ({
      page,
    }) => {
      const customLeads: MockLead[] = [
        {
          id: "lead-1",
          bot_name: "Support Assistant",
          name: "Sarah Connor",
          email: "sarah@skynet.com",
          phone: "+1 (555) 123-4567",
          created_at: "2026-08-11T12:00:00.000Z",
        },
        {
          id: "lead-2",
          bot_name: "Sales Pro Bot",
          name: "John Connor",
          email: "john.c@resistance.org",
          phone: "+1 (555) 987-6543",
          created_at: "2026-08-10T12:00:00.000Z",
        },
        {
          id: "lead-3",
          bot_name: "Billing Bot",
          name: "Kyle Reese",
          email: "kyle.reese@tech.com",
          phone: "+1 (555) 555-0199",
          created_at: "2026-08-09T12:00:00.000Z",
        },
      ];

      await mockBotAPIs(page, {
        leadsList: customLeads,
      });

      await page.goto("/admin/leads", { waitUntil: "domcontentloaded" });

      // Verify all initial rows are displayed
      const rows = page.getByTestId("lead-row");
      await expect(rows).toHaveCount(3);

      const searchInput = page.getByPlaceholder("Search leads...");
      await expect(searchInput).toBeVisible({ timeout: 10000 });

      // 1. Search by customer name
      await searchInput.fill("Sarah");
      await expect(rows).toHaveCount(1);
      await expect(rows.first()).toContainText("Sarah Connor");
      await expect(page.getByText("John Connor")).not.toBeVisible();

      // 2. Search by email address
      await searchInput.fill("resistance.org");
      await expect(rows).toHaveCount(1);
      await expect(rows.first()).toContainText("John Connor");
      await expect(rows.first()).toContainText("john.c@resistance.org");

      // 3. Search by bot name
      await searchInput.fill("Billing Bot");
      await expect(rows).toHaveCount(1);
      await expect(rows.first()).toContainText("Kyle Reese");
      await expect(rows.first().getByTestId("lead-bot")).toContainText(
        "Billing Bot",
      );

      // 4. Search with non-matching query -> verify empty state
      await searchInput.fill("NonExistentTerm123");
      await expect(rows).toHaveCount(0);
      await expect(
        page.getByText(/No leads found matching "NonExistentTerm123"/i),
      ).toBeVisible();

      // 5. Clear search query -> all rows restored
      await searchInput.fill("");
      await expect(rows).toHaveCount(3);
    });

    test("Test date range sorting (Newest vs Oldest First)", async ({
      page,
    }) => {
      const chronologicalLeads: MockLead[] = [
        {
          id: "lead-oldest",
          bot_name: "Support Bot",
          name: "Oldest Lead",
          email: "oldest@example.com",
          created_at: "2026-01-01T00:00:00.000Z",
        },
        {
          id: "lead-middle",
          bot_name: "Support Bot",
          name: "Middle Lead",
          email: "middle@example.com",
          created_at: "2026-06-01T00:00:00.000Z",
        },
        {
          id: "lead-newest",
          bot_name: "Support Bot",
          name: "Newest Lead",
          email: "newest@example.com",
          created_at: "2026-08-12T00:00:00.000Z",
        },
      ];

      await mockBotAPIs(page, {
        leadsList: chronologicalLeads,
      });

      await page.goto("/admin/leads", { waitUntil: "domcontentloaded" });

      const rows = page.getByTestId("lead-row");
      await expect(rows).toHaveCount(3);

      // Default sort order is "Newest First" (desc)
      await expect(rows.nth(0)).toContainText("Newest Lead");
      await expect(rows.nth(1)).toContainText("Middle Lead");
      await expect(rows.nth(2)).toContainText("Oldest Lead");

      // Change sort order via Select dropdown to "Oldest First"
      const sortSelect = page.getByTestId("sort-order-select");
      await sortSelect.selectOption("asc");

      await expect(rows.nth(0)).toContainText("Oldest Lead");
      await expect(rows.nth(1)).toContainText("Middle Lead");
      await expect(rows.nth(2)).toContainText("Newest Lead");

      // Click Date table header to toggle back to "Newest First"
      const dateHeader = page.getByTestId("sort-date-header");
      await dateHeader.click();

      await expect(rows.nth(0)).toContainText("Newest Lead");
      await expect(rows.nth(1)).toContainText("Middle Lead");
      await expect(rows.nth(2)).toContainText("Oldest Lead");
    });

    test("Test CSV export functionality and verify file content", async ({
      page,
    }) => {
      const exportLeads: MockLead[] = [
        {
          id: "lead-exp-1",
          bot_name: "Sales Bot",
          name: "Elena Rostova",
          email: "elena.rostova@example.com",
          phone: "+1 (555) 321-7654",
          created_at: "2026-08-10T15:30:00.000Z",
        },
        {
          id: "lead-exp-2",
          bot_name: "Sales Bot",
          name: "David Beckham",
          email: "david.beckham@example.com",
          phone: "+1 (555) 654-9870",
          created_at: "2026-08-09T10:00:00.000Z",
        },
      ];

      await mockBotAPIs(page, {
        leadsList: exportLeads,
      });

      await page.goto("/admin/leads", { waitUntil: "domcontentloaded" });

      const exportBtn = page.getByTestId("export-csv-btn");
      await expect(exportBtn).toBeVisible({ timeout: 10000 });
      await expect(exportBtn).toBeEnabled();

      // Trigger and intercept download event
      const downloadPromise = page.waitForEvent("download");
      await exportBtn.click();
      const download = await downloadPromise;

      // Verify downloaded filename
      expect(download.suggestedFilename()).toBe("agentify-leads.csv");

      // Verify CSV contents
      const stream = await download.createReadStream();
      expect(stream).not.toBeNull();

      if (stream) {
        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
        const csvText = Buffer.concat(chunks).toString("utf-8");

        expect(csvText).toMatch(
          /"?Name"?,.*"?Email"?,.*"?Phone"?,.*"?Collected By"?,.*"?Date"?/,
        );
        expect(csvText).toContain("Elena Rostova");
        expect(csvText).toContain("elena.rostova@example.com");
        expect(csvText).toContain("David Beckham");
        expect(csvText).toContain("david.beckham@example.com");
        expect(csvText).toContain("Sales Bot");
      }
    });

    test("Test pagination controls when lead list exceeds page size", async ({
      page,
    }) => {
      // Create 12 mock leads (pageSize is 8)
      const twelveLeads: MockLead[] = Array.from({ length: 12 }, (_, i) => ({
        id: `lead-page-${i + 1}`,
        bot_name: "Support Assistant",
        name: `Customer ${String(i + 1).padStart(2, "0")}`,
        email: `customer${i + 1}@example.com`,
        phone: `+1 (555) 000-${String(i + 1).padStart(4, "0")}`,
        created_at: new Date(2026, 7, 12 - i).toISOString(),
      }));

      await mockBotAPIs(page, {
        leadsList: twelveLeads,
      });

      await page.goto("/admin/leads", { waitUntil: "domcontentloaded" });

      const rows = page.getByTestId("lead-row");
      // Page 1 should display 8 items
      await expect(rows).toHaveCount(8);
      await expect(rows.first()).toContainText("Customer 01");

      // Find pagination Next button
      const nextBtn = page
        .getByRole("button", { name: "Next page" })
        .or(page.locator('button[aria-label="Next page"]'))
        .first();
      await expect(nextBtn).toBeVisible();
      await nextBtn.click();

      // Page 2 should display remaining 4 items
      await expect(rows).toHaveCount(4);
      await expect(rows.first()).toContainText("Customer 09");
    });
  });
});
