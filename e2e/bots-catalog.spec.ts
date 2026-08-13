import { test, expect } from '@playwright/test';
import { mockBotAPIs, MOCK_BOT, setSessionViaInitScript } from './bot-helpers';
import { mockSupabaseAuth } from './auth-helpers';
import { Bot } from '@/types/bot';

test.describe('Bots Catalog & Fleet Management Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
    await setSessionViaInitScript(page);
    await mockSupabaseAuth(page);
  });

  test.describe('E2E-5.1: Bots Catalog Listing & Search Filtering', () => {
    const BOT_1: Bot = {
      ...MOCK_BOT,
      id: 'b1111111-1111-1111-1111-111111111111',
      public_key: 'pk_support_bot_001',
      name: 'Apex Concierge AI',
      company_name: 'Apex Innovations',
      description: 'Automated 24/7 customer reception and concierge.',
      primary_color: '#4f46e5',
    };

    const BOT_2: Bot = {
      ...MOCK_BOT,
      id: 'b2222222-2222-2222-2222-222222222222',
      public_key: 'pk_sales_bot_002',
      name: 'Sales Rocket Assistant',
      company_name: 'Cyberdyne Retail',
      description: 'E-commerce sales closer and product recommender.',
      primary_color: '#059669',
    };

    const BOT_3: Bot = {
      ...MOCK_BOT,
      id: 'b3333333-3333-3333-3333-333333333333',
      public_key: 'pk_billing_bot_003',
      name: 'Billing Support Bot',
      company_name: 'Stripe Integrations Ltd',
      description: 'Resolves subscription invoices and refund requests.',
      primary_color: '#dc2626',
    };

    test('should render all active bots in catalog with card details and company meta', async ({
      page,
    }) => {
      await mockBotAPIs(page, {
        botsList: [BOT_1, BOT_2, BOT_3],
      });

      await page.goto('/admin/bots', { waitUntil: 'domcontentloaded' });

      const searchInput = page.getByPlaceholder('Search bots...');
      await expect(searchInput).toBeVisible({ timeout: 15000 });

      await expect(page.getByTitle('Apex Concierge AI').first()).toBeVisible({ timeout: 10000 });
      await expect(page.getByTitle('Apex Innovations').first()).toBeVisible();

      await expect(page.getByTitle('Sales Rocket Assistant').first()).toBeVisible();
      await expect(page.getByTitle('Cyberdyne Retail').first()).toBeVisible();

      await expect(page.getByTitle('Billing Support Bot').first()).toBeVisible();
      await expect(page.getByTitle('Stripe Integrations Ltd').first()).toBeVisible();
    });

    test('should filter bots in real-time by bot name, company name, and description', async ({
      page,
    }) => {
      await mockBotAPIs(page, {
        botsList: [BOT_1, BOT_2, BOT_3],
      });

      await page.goto('/admin/bots', { waitUntil: 'domcontentloaded' });

      const searchInput = page.getByPlaceholder('Search bots...');
      await expect(searchInput).toBeVisible({ timeout: 15000 });

      await searchInput.fill('Sales Rocket');

      await expect(page.getByTitle('Sales Rocket Assistant').first()).toBeVisible();
      await expect(page.getByTitle('Apex Concierge AI').first()).not.toBeVisible();
      await expect(page.getByTitle('Billing Support Bot').first()).not.toBeVisible();

      await searchInput.fill('Apex Innovations');

      await expect(page.getByTitle('Apex Concierge AI').first()).toBeVisible();
      await expect(page.getByTitle('Apex Innovations').first()).toBeVisible();
      await expect(page.getByTitle('Sales Rocket Assistant').first()).not.toBeVisible();
      await expect(page.getByTitle('Billing Support Bot').first()).not.toBeVisible();

      await searchInput.fill('subscription invoices');

      await expect(page.getByTitle('Billing Support Bot').first()).toBeVisible();
      await expect(page.getByTitle('Stripe Integrations Ltd').first()).toBeVisible();
      await expect(page.getByTitle('Apex Concierge AI').first()).not.toBeVisible();
      await expect(page.getByTitle('Sales Rocket Assistant').first()).not.toBeVisible();

      await searchInput.fill('');

      await expect(page.getByTitle('Apex Concierge AI').first()).toBeVisible();
      await expect(page.getByTitle('Sales Rocket Assistant').first()).toBeVisible();
      await expect(page.getByTitle('Billing Support Bot').first()).toBeVisible();
    });

    test('should display empty state when search query yields no matching bots', async ({
      page,
    }) => {
      await mockBotAPIs(page, {
        botsList: [BOT_1, BOT_2, BOT_3],
      });

      await page.goto('/admin/bots', { waitUntil: 'domcontentloaded' });

      const searchInput = page.getByPlaceholder('Search bots...');
      await expect(searchInput).toBeVisible({ timeout: 15000 });

      const nonMatchingTerm = 'NonExistentBot999';
      await searchInput.fill(nonMatchingTerm);

      await expect(page.getByTitle('Apex Concierge AI').first()).not.toBeVisible();
      await expect(page.getByTitle('Sales Rocket Assistant').first()).not.toBeVisible();
      await expect(page.getByTitle('Billing Support Bot').first()).not.toBeVisible();

      await expect(
        page.getByText(`No bots found matching "${nonMatchingTerm}"`)
      ).toBeVisible({ timeout: 10000 });
      await expect(
        page.getByText('Try adjusting your search terms or filters')
      ).toBeVisible();
    });
  });

  test.describe('E2E-5.2: Bots Catalog Pagination & Empty State', () => {
    test('should render zero-bot empty state banner with mini-chat preview illustration and redirect to create bot', async ({
      page,
    }) => {
      await mockBotAPIs(page, {
        botsList: [],
      });

      await page.goto('/admin/bots', { waitUntil: 'domcontentloaded' });

      await expect(page.getByText('AI Bot')).toBeVisible({ timeout: 15000 });

      await expect(page.getByText('No agents yet...')).toBeVisible({ timeout: 15000 });
      await expect(
        page.getByText(
          'Create your first AI Agent to start automating support, generating leads, and answering customer questions'
        )
      ).toBeVisible();

      const newAgentBtn = page.getByRole('button', { name: /New AI agent/i });
      await expect(newAgentBtn).toBeVisible();
      await newAgentBtn.click();

      await expect(page).toHaveURL(/\/admin\/new/, { timeout: 10000 });
      await expect(page.getByPlaceholder('e.g. Support Assistant')).toBeVisible({ timeout: 10000 });
    });

    test('should handle catalog pagination when bot count exceeds pageSize = 8 (page 1 -> page 2 transitions, navigation disable states, and back to page 1)', async ({
      page,
    }) => {
      const twelveBots: Bot[] = Array.from({ length: 12 }, (_, index) => ({
        ...MOCK_BOT,
        id: `bot-page-id-${index + 1}`,
        public_key: `pk_page_bot_${index + 1}`,
        name: `Agent Fleet ${String(index + 1).padStart(2, '0')}`,
        company_name: `Company ${String(index + 1).padStart(2, '0')}`,
        description: `Autonomous assistant ${index + 1}`,
      }));

      await mockBotAPIs(page, {
        botsList: twelveBots,
      });

      await page.goto('/admin/bots', { waitUntil: 'domcontentloaded' });

      await expect(page.getByText('Showing 1 to 8 of 12 entries')).toBeVisible({ timeout: 15000 });

      await expect(page.getByTitle('Agent Fleet 01').first()).toBeVisible({ timeout: 10000 });
      await expect(page.getByTitle('Agent Fleet 08').first()).toBeVisible();
      await expect(page.getByTitle('Agent Fleet 09').first()).not.toBeVisible();

      const prevBtn = page.locator('button[aria-label="Previous page"]').first();
      const nextBtn = page.locator('button[aria-label="Next page"]').first();

      await expect(prevBtn).toBeDisabled();
      await expect(nextBtn).toBeEnabled();

      await nextBtn.click();

      await expect(page.getByText('Showing 9 to 12 of 12 entries')).toBeVisible({ timeout: 10000 });
      await expect(page.getByTitle('Agent Fleet 09').first()).toBeVisible({ timeout: 10000 });
      await expect(page.getByTitle('Agent Fleet 12').first()).toBeVisible();
      await expect(page.getByTitle('Agent Fleet 01').first()).not.toBeVisible();

      await expect(nextBtn).toBeDisabled();
      await expect(prevBtn).toBeEnabled();

      await prevBtn.click();

      await expect(page.getByText('Showing 1 to 8 of 12 entries')).toBeVisible({ timeout: 10000 });
      await expect(page.getByTitle('Agent Fleet 01').first()).toBeVisible({ timeout: 10000 });
      await expect(page.getByTitle('Agent Fleet 08').first()).toBeVisible();
      await expect(page.getByTitle('Agent Fleet 09').first()).not.toBeVisible();
      await expect(prevBtn).toBeDisabled();
      await expect(nextBtn).toBeEnabled();
    });
  });

  test.describe('E2E-5.3: Bot Card Actions & Navigation Routing', () => {
    const ACTION_BOT: Bot = {
      ...MOCK_BOT,
      id: 'b5555555-5555-5555-5555-555555555555',
      public_key: 'pk_action_bot_555',
      name: 'Operations Manager AI',
      company_name: 'Nexus Logistics',
      description: 'Logistics routing assistant.',
    };

    test('should open card menu and navigate to bot edit page', async ({ page }) => {
      await mockBotAPIs(page, {
        bot: ACTION_BOT,
        botsList: [ACTION_BOT],
      });

      await page.goto('/admin/bots', { waitUntil: 'domcontentloaded' });

      await expect(page.getByTitle('Operations Manager AI').first()).toBeVisible({ timeout: 15000 });

      const moreBtn = page.getByRole('button', { name: 'More options' }).first();
      await expect(moreBtn).toBeVisible();
      await moreBtn.click();

      const editItem = page.getByRole('button', { name: 'Edit' }).first();
      await expect(editItem).toBeVisible();
      await editItem.click();

      await expect(page).toHaveURL(/\/admin\/bot\/.*\/edit-bot/, { timeout: 15000 });
      await expect(page.getByRole('button', { name: /Update Bot/i })).toBeVisible({ timeout: 15000 });
    });

    test('should open card menu and navigate to bot ingest page', async ({ page }) => {
      await mockBotAPIs(page, {
        bot: ACTION_BOT,
        botsList: [ACTION_BOT],
      });

      await page.goto('/admin/bots', { waitUntil: 'domcontentloaded' });

      await expect(page.getByTitle('Operations Manager AI').first()).toBeVisible({ timeout: 15000 });

      const moreBtn = page.getByRole('button', { name: 'More options' }).first();
      await expect(moreBtn).toBeVisible();
      await moreBtn.click();

      const ingestItem = page.getByRole('button', { name: 'Ingest' }).first();
      await expect(ingestItem).toBeVisible();
      await ingestItem.click();

      await expect(page).toHaveURL(/\/admin\/bots\/.*\/ingest/, { timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Ingest Website URL/i })).toBeVisible({ timeout: 15000 });
    });

    test('should open card menu and copy bot public key', async ({ page }) => {
      await mockBotAPIs(page, {
        bot: ACTION_BOT,
        botsList: [ACTION_BOT],
      });

      await page.goto('/admin/bots', { waitUntil: 'domcontentloaded' });

      await expect(page.getByTitle('Operations Manager AI').first()).toBeVisible({ timeout: 15000 });

      const moreBtn = page.getByRole('button', { name: 'More options' }).first();
      await expect(moreBtn).toBeVisible();
      await moreBtn.click();

      const copyItem = page.getByRole('button', { name: /Copy Key/i }).first();
      await expect(copyItem).toBeVisible();
      await copyItem.click();

      await expect(page.getByText('Copied Key!')).toBeVisible();
    });

    test('should navigate to bot demo playground (/demo) and verify interactive widget', async ({
      page,
    }) => {
      await mockBotAPIs(page, {
        bot: ACTION_BOT,
        botsList: [ACTION_BOT],
      });

      await page.goto(`/demo?botId=${ACTION_BOT.id}`, { waitUntil: 'domcontentloaded' });

      await expect(page.locator('div').filter({ hasText: /^Agentify\s*Store$/ }).first()).toBeVisible({ timeout: 20000 });

      const launcherBtn = page.locator('button').filter({ has: page.locator('img[alt="chat"]') }).first();
      await expect(launcherBtn).toBeVisible({ timeout: 20000 });

      await launcherBtn.click({ force: true });
      const widgetContainer = page.locator('#ai-widget').last();
      await expect(widgetContainer).toBeAttached({ timeout: 15000 });
      await expect(widgetContainer).toHaveCSS('display', 'flex', { timeout: 15000 });

      const botHeader = widgetContainer.locator('#bot-header');
      await expect(botHeader).toBeVisible();
      await expect(widgetContainer.locator('#bot-name')).toHaveText('Operations Manager AI');
    });

    test('should inspect and verify embed script snippets (HTML and Next.js tabs) on bot ingest page', async ({
      page,
    }) => {
      await mockBotAPIs(page, {
        bot: ACTION_BOT,
        botsList: [ACTION_BOT],
      });

      await page.goto(`/admin/bots/${ACTION_BOT.public_key}/ingest`, { waitUntil: 'domcontentloaded' });

      const urlInput = page.getByPlaceholder('https://example.com');
      await urlInput.fill('https://example.com/logistics-docs');

      const ingestBtn = page.getByRole('button', { name: 'Ingest All Selected Sources' });
      await ingestBtn.click();

      await expect(page.getByText('Your chatbot is ready!')).toBeVisible({ timeout: 20000 });
      await expect(page.getByText(`Bot Public Key: ${ACTION_BOT.public_key}`)).toBeVisible();

      const htmlTab = page.getByRole('button', { name: /HTML/i });
      await expect(htmlTab).toBeVisible();
      await expect(page.getByText('index.html')).toBeVisible();
      await expect(page.getByText(`bot-id="${ACTION_BOT.public_key}"`)).toBeVisible();
      await expect(page.getByText('/widget.js')).toBeVisible();

      const copyBtn = page.getByRole('button', { name: /Copy/i }).first();
      await expect(copyBtn).toBeVisible();
      await copyBtn.click();
      await expect(page.getByText('Copied!')).toBeVisible();

      const nextjsTab = page.getByRole('button', { name: 'Next.js', exact: true });
      await expect(nextjsTab).toBeVisible();
      await nextjsTab.click();

      await expect(page.getByText('Layout.tsx')).toBeVisible();
      await expect(page.getByText(`bot-id="${ACTION_BOT.public_key}"`)).toBeVisible();
      await expect(page.getByText('import Script from "next/script";')).toBeVisible();
    });
  });
});
