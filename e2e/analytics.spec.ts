import { test, expect } from '@playwright/test';
import { mockBotAPIs, MOCK_BOT, setSessionViaInitScript, MockLead, MockConversation } from './bot-helpers';
import { mockSupabaseAuth } from './auth-helpers';
import { Bot } from '@/types/bot';

test.describe('Analytics Dashboard Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setSessionViaInitScript(page);
    await mockSupabaseAuth(page);
  });

  test.describe('E2E-4.4: Analytics Dashboard (/admin)', () => {
    const ANALYTICS_BOT: Bot = {
      ...MOCK_BOT,
      id: 'b9999999-4444-5555-6666-777777777777',
      public_key: 'pk_analytics_bot_888',
      name: 'Analytics Concierge AI',
      contact_enabled: true,
      contact_prompt: 'Please leave your contact info for updates.',
    };

    const SECOND_BOT: Bot = {
      ...MOCK_BOT,
      id: 'b8888888-5555-6666-7777-888888888888',
      public_key: 'pk_support_bot_777',
      name: 'Support Specialist AI',
      contact_enabled: true,
    };

    const THIRD_BOT: Bot = {
      ...MOCK_BOT,
      id: 'b7777777-6666-7777-8888-999999999999',
      public_key: 'pk_faq_bot_666',
      name: 'FAQ Assistant AI',
      contact_enabled: false,
    };

    test('Verify overview metric cards reflect leads, chats, conversion rates, and tokens', async ({
      page,
    }) => {
      await mockBotAPIs(page, {
        bot: ANALYTICS_BOT,
        botsList: [ANALYTICS_BOT, SECOND_BOT],
        analytics: {
          totals: {
            total_leads: 15,
            total_conversations: 60,
            total_messages: 360,
          },
          convosPerBot: [
            {
              bot_id: ANALYTICS_BOT.id,
              bot_name: ANALYTICS_BOT.name,
              total_conversations: 40,
              total_messages: 240,
            },
            {
              bot_id: SECOND_BOT.id,
              bot_name: SECOND_BOT.name,
              total_conversations: 20,
              total_messages: 120,
            },
          ],
          leadsPerBot: [
            {
              bot_id: ANALYTICS_BOT.id,
              bot_name: ANALYTICS_BOT.name,
              total_leads: 12,
            },
            {
              bot_id: SECOND_BOT.id,
              bot_name: SECOND_BOT.name,
              total_leads: 3,
            },
          ],
          monthlyTrend: [
            { month: 'Jun 26', conversations: 40, leads: 10 },
            { month: 'Jul 26', conversations: 60, leads: 15 },
          ],
        },
      });

      await page.goto('/admin', { waitUntil: 'domcontentloaded' });

      const statsGrid = page.getByTestId('stats-grid');
      await expect(statsGrid).toBeVisible({ timeout: 15000 });

      const leadsCard = page.getByTestId('stats-card-total-leads');
      await expect(leadsCard).toBeVisible();
      await expect(leadsCard.getByTestId('stat-value')).toHaveText('15');
      await expect(leadsCard.getByTestId('stat-label')).toHaveText('Total Leads');

      const convosCard = page.getByTestId('stats-card-conversation');
      await expect(convosCard).toBeVisible();
      await expect(convosCard.getByTestId('stat-value')).toHaveText('60');
      await expect(convosCard.getByTestId('stat-label')).toHaveText('Conversation');

      const conversionCard = page.getByTestId('stats-card-conversion-rate');
      await expect(conversionCard).toBeVisible();
      await expect(conversionCard.getByTestId('stat-value')).toHaveText('25.0%');
      await expect(conversionCard.getByTestId('stat-label')).toHaveText('Conversion Rate');

      const tokenCard = page.getByTestId('stats-card-token-used');
      await expect(tokenCard).toBeVisible();
      await expect(tokenCard.getByTestId('stat-value')).toHaveText('360');
      await expect(tokenCard.getByTestId('stat-label')).toHaveText('Token used');
    });

    test('Verify dynamic live propagation: customer chat & lead capture update metrics and recent activity', async ({
      page,
    }) => {
      const sharedConversations: MockConversation[] = [
        {
          id: 'convo-existing-1',
          bot_id: ANALYTICS_BOT.id,
          bot_name: ANALYTICS_BOT.name,
          state: 'closed',
          name: 'Prior User',
          email: 'prior@example.com',
          created_at: '2026-08-01T10:00:00.000Z',
          messages: [{ role: 'user', content: 'Hello' }],
        },
        {
          id: 'convo-existing-2',
          bot_id: ANALYTICS_BOT.id,
          bot_name: ANALYTICS_BOT.name,
          state: 'closed',
          created_at: '2026-08-02T10:00:00.000Z',
          messages: [{ role: 'user', content: 'Info please' }],
        },
        {
          id: 'convo-existing-3',
          bot_id: ANALYTICS_BOT.id,
          bot_name: ANALYTICS_BOT.name,
          state: 'closed',
          created_at: '2026-08-03T10:00:00.000Z',
          messages: [{ role: 'user', content: 'Pricing?' }],
        },
      ];

      const sharedLeads: MockLead[] = [
        {
          id: 'lead-existing-1',
          bot_id: ANALYTICS_BOT.id,
          bot_name: ANALYTICS_BOT.name,
          name: 'Prior Lead',
          email: 'prior@example.com',
          phone: '+1 (555) 111-2222',
          created_at: '2026-08-01T10:00:00.000Z',
        },
      ];

      await mockBotAPIs(page, {
        bot: ANALYTICS_BOT,
        botsList: [ANALYTICS_BOT],
        sharedStore: sharedConversations,
        sharedLeadsStore: sharedLeads,
        analytics: () => {
          const totalConvos = sharedConversations.length;
          const totalLeads = sharedLeads.length;
          return {
            totals: {
              total_leads: totalLeads,
              total_conversations: totalConvos,
              total_messages: totalConvos * 4,
            },
            convosPerBot: [
              {
                bot_id: ANALYTICS_BOT.id,
                bot_name: ANALYTICS_BOT.name,
                total_conversations: totalConvos,
              },
            ],
            leadsPerBot: [
              {
                bot_id: ANALYTICS_BOT.id,
                bot_name: ANALYTICS_BOT.name,
                total_leads: totalLeads,
              },
            ],
            monthlyTrend: [
              { month: 'Aug 26', conversations: totalConvos, leads: totalLeads },
            ],
          };
        },
        chatResponses: [
          'Hello! We have captured your contact info. An agent will follow up shortly.',
        ],
        onChatMessage: ({ message }) => {
          if (message.toLowerCase().includes('sarah')) {
            sharedLeads.unshift({
              id: 'lead-new-sarah',
              bot_id: ANALYTICS_BOT.id,
              bot_name: ANALYTICS_BOT.name,
              name: 'Sarah Connor',
              email: 'sarah.connor@example.com',
              phone: '+1 (555) 333-4444',
              created_at: new Date().toISOString(),
            });
          }
        },
      });

      await page.goto('/admin', { waitUntil: 'domcontentloaded' });
      const initialLeadsCard = page.getByTestId('stats-card-total-leads');
      await expect(initialLeadsCard.getByTestId('stat-value')).toHaveText('1');

      const initialConvosCard = page.getByTestId('stats-card-conversation');
      await expect(initialConvosCard.getByTestId('stat-value')).toHaveText('3');

      const initialConversionCard = page.getByTestId('stats-card-conversion-rate');
      await expect(initialConversionCard.getByTestId('stat-value')).toHaveText('33.3%');

      await page.goto(`/demo?botId=${ANALYTICS_BOT.id}`, { waitUntil: 'domcontentloaded' });

      const launcherBtn = page
        .locator('button')
        .filter({ has: page.locator('img[alt="chat"]') })
        .first();
      await expect(launcherBtn).toBeVisible({ timeout: 20000 });

      const widgetContainer = page.locator('#ai-widget').last();
      await launcherBtn.click({ force: true });
      await expect(widgetContainer).toHaveCSS('display', 'flex', { timeout: 15000 });

      const chatInput = widgetContainer.locator('#ai-input');
      const sendButton = widgetContainer.locator('#bot-send-btn');
      const messagesContainer = widgetContainer.locator('#ai-messages');

      await expect(chatInput).toBeVisible({ timeout: 10000 });

      await chatInput.fill('Hi, my name is Sarah Connor and email is sarah.connor@example.com');
      await sendButton.click();

      await expect(
        messagesContainer.getByText('Hi, my name is Sarah Connor and email is sarah.connor@example.com')
      ).toBeVisible({ timeout: 10000 });

      await expect(
        messagesContainer.getByText(/We have captured your contact info/i)
      ).toBeVisible({ timeout: 15000 });

      await page.goto('/admin', { waitUntil: 'domcontentloaded' });

      const updatedLeadsCard = page.getByTestId('stats-card-total-leads');
      await expect(updatedLeadsCard.getByTestId('stat-value')).toHaveText('2', { timeout: 10000 });

      const updatedConvosCard = page.getByTestId('stats-card-conversation');
      await expect(updatedConvosCard.getByTestId('stat-value')).toHaveText('4');

      const updatedConversionCard = page.getByTestId('stats-card-conversion-rate');
      await expect(updatedConversionCard.getByTestId('stat-value')).toHaveText('50.0%');

      const recentActivityList = page.getByTestId('recent-activity-list');
      await expect(recentActivityList).toBeVisible();
      await expect(recentActivityList.getByText('New Lead Captured').first()).toBeVisible();
    });

    test('Verify Agent Performance table displays per-bot metrics and manage links', async ({
      page,
    }) => {
      await mockBotAPIs(page, {
        bot: ANALYTICS_BOT,
        botsList: [ANALYTICS_BOT, SECOND_BOT, THIRD_BOT],
        analytics: {
          totals: {
            total_leads: 25,
            total_conversations: 70,
            total_messages: 400,
          },
          convosPerBot: [
            {
              bot_id: ANALYTICS_BOT.id,
              bot_name: ANALYTICS_BOT.name,
              total_conversations: 40,
              total_messages: 240,
            },
            {
              bot_id: SECOND_BOT.id,
              bot_name: SECOND_BOT.name,
              total_conversations: 20,
              total_messages: 120,
            },
            {
              bot_id: THIRD_BOT.id,
              bot_name: THIRD_BOT.name,
              total_conversations: 10,
              total_messages: 40,
            },
          ],
          leadsPerBot: [
            {
              bot_id: ANALYTICS_BOT.id,
              bot_name: ANALYTICS_BOT.name,
              total_leads: 20,
            },
            {
              bot_id: SECOND_BOT.id,
              bot_name: SECOND_BOT.name,
              total_leads: 5,
            },
            {
              bot_id: THIRD_BOT.id,
              bot_name: THIRD_BOT.name,
              total_leads: 0,
            },
          ],
          monthlyTrend: [],
        },
      });

      await page.goto('/admin', { waitUntil: 'domcontentloaded' });

      const performanceTable = page.getByTestId('performance-table');
      await expect(performanceTable).toBeVisible({ timeout: 15000 });

      await expect(performanceTable.getByText('Agent')).toBeVisible();
      await expect(performanceTable.getByText('Conversations')).toBeVisible();
      await expect(performanceTable.getByText('Leads')).toBeVisible();
      await expect(performanceTable.getByText('Conversion')).toBeVisible();
      await expect(performanceTable.getByText('Action')).toBeVisible();

      const rows = page.getByTestId('performance-row');
      await expect(rows).toHaveCount(3);

      const row1 = rows.nth(0);
      await expect(row1.getByTestId('perf-agent-name')).toHaveText('Analytics Concierge AI');
      await expect(row1.getByTestId('perf-chats')).toHaveText('40 chats');
      await expect(row1.getByTestId('perf-leads')).toHaveText('20');
      await expect(row1.getByTestId('perf-conversion-rate')).toHaveText('50%');
      await expect(row1.getByTestId('perf-manage-btn')).toBeVisible();

      const row2 = rows.nth(1);
      await expect(row2.getByTestId('perf-agent-name')).toHaveText('Support Specialist AI');
      await expect(row2.getByTestId('perf-chats')).toHaveText('20 chats');
      await expect(row2.getByTestId('perf-leads')).toHaveText('05');
      await expect(row2.getByTestId('perf-conversion-rate')).toHaveText('25%');

      const row3 = rows.nth(2);
      await expect(row3.getByTestId('perf-agent-name')).toHaveText('FAQ Assistant AI');
      await expect(row3.getByTestId('perf-chats')).toHaveText('10 chats');
      await expect(row3.getByTestId('perf-leads')).toHaveText('00');
      await expect(row3.getByTestId('perf-conversion-rate')).toHaveText('0%');

      await row1.getByTestId('perf-manage-btn').click();
      await expect(page).toHaveURL(new RegExp(`/admin/bot/${ANALYTICS_BOT.id}/edit-bot|/admin/bots`));
    });

    test('Verify Visual Analytics charts and interactive timeframe selector', async ({ page }) => {
      await mockBotAPIs(page, {
        bot: ANALYTICS_BOT,
        botsList: [ANALYTICS_BOT],
        analytics: {
          totals: {
            total_leads: 18,
            total_conversations: 50,
            total_messages: 200,
          },
          convosPerBot: [
            {
              bot_id: ANALYTICS_BOT.id,
              bot_name: ANALYTICS_BOT.name,
              total_conversations: 50,
              total_messages: 200,
            },
          ],
          leadsPerBot: [
            {
              bot_id: ANALYTICS_BOT.id,
              bot_name: ANALYTICS_BOT.name,
              total_leads: 18,
            },
          ],
          monthlyTrend: [
            { month: 'Jun 26', conversations: 20, leads: 6 },
            { month: 'Jul 26', conversations: 35, leads: 12 },
            { month: 'Aug 26', conversations: 50, leads: 18 },
          ],
        },
      });

      await page.goto('/admin', { waitUntil: 'domcontentloaded' });

      const barChartCard = page.getByTestId('leads-over-time-card');
      await expect(barChartCard).toBeVisible({ timeout: 15000 });
      await expect(barChartCard.getByText('Leads Over Time')).toBeVisible();
      await expect(barChartCard.getByText('Conversation')).toBeVisible();
      await expect(barChartCard.getByText('Leads', { exact: true })).toBeVisible();

      const timeframeSelect = page.getByTestId('timeframe-select');
      await expect(timeframeSelect).toBeVisible();
      await expect(timeframeSelect).toHaveValue('Monthly');

      await timeframeSelect.selectOption('Weekly');
      await expect(timeframeSelect).toHaveValue('Weekly');

      await timeframeSelect.selectOption('Daily');
      await expect(timeframeSelect).toHaveValue('Daily');

      const pieChartCard = page.getByTestId('leads-by-source-card');
      await expect(pieChartCard).toBeVisible({ timeout: 15000 });
      await expect(pieChartCard.getByText('Leads by Source')).toBeVisible();
    });

    test('Verify Recent Activity feed navigation and Quick Actions buttons', async ({ page }) => {
      await mockBotAPIs(page, {
        bot: ANALYTICS_BOT,
        botsList: [ANALYTICS_BOT],
      });

      await page.goto('/admin', { waitUntil: 'domcontentloaded' });

      const recentActivity = page.getByTestId('recent-activity-list');
      await expect(recentActivity).toBeVisible({ timeout: 15000 });

      const leadActivityItem = page.getByTestId('recent-activity-item').first();
      await expect(leadActivityItem).toBeVisible();
      await leadActivityItem.click();

      await expect(page).toHaveURL(/\/admin\/leads/);

      await page.goto('/admin', { waitUntil: 'domcontentloaded' });

      const quickActions = page.getByTestId('quick-actions-row');
      await expect(quickActions).toBeVisible({ timeout: 15000 });

      const createBotBtn = page.getByTestId('quick-action-create-bot');
      await expect(createBotBtn).toBeVisible();
      await createBotBtn.click();

      await expect(page).toHaveURL(/\/admin\/new/);
    });

    test('Verify graceful empty state handling when no conversations or leads exist', async ({ page }) => {
      await mockBotAPIs(page, {
        bot: ANALYTICS_BOT,
        botsList: [ANALYTICS_BOT],
        analytics: {
          totals: {
            total_leads: 0,
            total_conversations: 0,
            total_messages: 0,
          },
          convosPerBot: [],
          leadsPerBot: [],
          monthlyTrend: [],
        },
      });

      await page.goto('/admin', { waitUntil: 'domcontentloaded' });

      const leadsCard = page.getByTestId('stats-card-total-leads');
      await expect(leadsCard.getByTestId('stat-value')).toHaveText('0');

      const convosCard = page.getByTestId('stats-card-conversation');
      await expect(convosCard.getByTestId('stat-value')).toHaveText('0');

      const conversionCard = page.getByTestId('stats-card-conversion-rate');
      await expect(conversionCard.getByTestId('stat-value')).toHaveText('0.0%');

      const emptyState = page.getByTestId('performance-empty-state');
      await expect(emptyState).toBeVisible({ timeout: 15000 });
      await expect(emptyState).toContainText('Start a conversation to see performance metrics.');
    });
  });
});
