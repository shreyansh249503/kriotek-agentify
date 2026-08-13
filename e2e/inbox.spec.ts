import { test, expect } from '@playwright/test';
import { mockBotAPIs, MOCK_BOT, setSessionViaInitScript, MockConversation } from './bot-helpers';
import { mockSupabaseAuth } from './auth-helpers';
import { Bot } from '@/types/bot';

test.describe('Live Support & Human Agent Handoff Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setSessionViaInitScript(page);
    await mockSupabaseAuth(page);
  });

  test.describe('E2E-4.1: Human Agent Handoff (/admin/inbox)', () => {
    const HANDOFF_BOT: Bot = {
      ...MOCK_BOT,
      id: 'b8888888-9999-aaaa-bbbb-cccccccccccc',
      public_key: 'pk_handoff_live_777',
      name: 'Apex Concierge AI',
      primary_color: '#4f46e5',
      ecommerce_enabled: true,
    };

    test('Customer requests human assistance in chat -> trigger manual handoff. Verify conversation appears live in /admin/inbox with status manual_takeover', async ({
      page,
    }) => {
      let manualHandoffTriggered = false;
      let lastAdminReply = '';
      let conversationResolved = false;

      await mockBotAPIs(page, {
        bot: HANDOFF_BOT,
        botsList: [HANDOFF_BOT],
        chatResponses: [
          "Sure, I can connect you to our customer support. Please click the button below to start the support session. [SHOW_SUPPORT_BUTTON]",
          "Message sent to customer support.",
        ],
        onSwitchToManual: () => {
          manualHandoffTriggered = true;
        },
        onAdminReply: ({ message }) => {
          lastAdminReply = message;
        },
        onAdminClose: () => {
          conversationResolved = true;
        },
      });

      await page.goto(`/demo?botId=${HANDOFF_BOT.id}`, { waitUntil: 'domcontentloaded' });

      const launcherBtn = page.locator('button').filter({ has: page.locator('img[alt="chat"]') }).first();
      await expect(launcherBtn).toBeVisible({ timeout: 20000 });

      const widgetContainer = page.locator('#ai-widget').last();
      await expect(widgetContainer).toBeAttached({ timeout: 20000 });

      await launcherBtn.click({ force: true });
      await expect(widgetContainer).toHaveCSS('display', 'flex', { timeout: 15000 });

      const chatInput = widgetContainer.locator('#ai-input');
      const sendButton = widgetContainer.locator('#bot-send-btn');
      const messagesContainer = widgetContainer.locator('#ai-messages');

      await expect(chatInput).toBeVisible({ timeout: 15000 });
      await expect(sendButton).toBeVisible({ timeout: 15000 });

      await chatInput.fill('Can I speak with a human support agent please?');
      await sendButton.click();

      await expect(
        messagesContainer.getByText('Can I speak with a human support agent please?')
      ).toBeVisible({ timeout: 10000 });

      await expect(
        messagesContainer.getByText(/Sure, I can connect you to our customer support/i)
      ).toBeVisible({ timeout: 15000 });

      const handoffBtn = messagesContainer.locator('button').filter({ hasText: /Talk to customer support/i }).first();
      await expect(handoffBtn).toBeVisible({ timeout: 10000 });

      await handoffBtn.click();

      await expect(
        messagesContainer.getByText(/Connecting to support representative/i)
      ).toBeVisible({ timeout: 10000 });

      await expect(chatInput).toHaveAttribute('placeholder', 'Type a message to support...', { timeout: 10000 });
      expect(manualHandoffTriggered).toBe(true);

      await chatInput.fill('Hello support team, my order item arrived damaged, please help.');
      await sendButton.click();

      await expect(
        messagesContainer.getByText('Hello support team, my order item arrived damaged, please help.')
      ).toBeVisible({ timeout: 10000 });

      await page.goto('/admin/inbox', { waitUntil: 'domcontentloaded' });

      await expect(page.getByText(/Active Handovers/i)).toBeVisible({ timeout: 20000 });

      const statusBadge = page.locator('[data-testid="convo-status-badge"]').first();
      await expect(statusBadge).toBeVisible({ timeout: 15000 });
      await expect(statusBadge).toHaveText(/manual_takeover/i);

      await expect(page.getByText('Apex Concierge AI').first()).toBeVisible({ timeout: 10000 });

      const activeHeaderStatusBadge = page.locator('[data-testid="active-convo-status-badge"]').first();
      await expect(activeHeaderStatusBadge).toBeVisible({ timeout: 15000 });
      await expect(activeHeaderStatusBadge).toHaveText(/manual_takeover/i);

      await expect(
        page.getByText(/Chat transferred to customer support/i).first()
      ).toBeVisible({ timeout: 15000 });

      const replyInput = page.getByPlaceholder('Type your reply to customer...');
      await expect(replyInput).toBeVisible({ timeout: 15000 });

      await replyInput.fill('Hello! This is agent Sarah from support. I will issue an immediate replacement for you.');
      const replySendBtn = replyInput.locator('..').locator('button[type="submit"]');
      await replySendBtn.click();

      await expect(replyInput).toHaveValue('', { timeout: 10000 });
      expect(lastAdminReply).toBe('Hello! This is agent Sarah from support. I will issue an immediate replacement for you.');

      const resolveBtn = page.getByRole('button', { name: /Mark Resolved \/ Revert to AI/i });
      await expect(resolveBtn).toBeVisible({ timeout: 15000 });
      await resolveBtn.click();

      await expect.poll(() => conversationResolved, { timeout: 15000 }).toBe(true);
    });

    test('should render empty state in /admin/inbox when no active manual takeovers exist', async ({
      page,
    }) => {
      await mockBotAPIs(page, {
        bot: HANDOFF_BOT,
        botsList: [HANDOFF_BOT],
        conversations: [],
      });

      await page.goto('/admin/inbox', { waitUntil: 'domcontentloaded' });

      await expect(page.getByText('No active support requests')).toBeVisible({ timeout: 15000 });
      await expect(page.getByText('Select a Support Chat')).toBeVisible({ timeout: 15000 });
      await expect(
        page.getByText(/Select an active customer handover conversation from the sidebar/i)
      ).toBeVisible({ timeout: 15000 });
    });

    test('should allow selecting different active handover conversations and viewing customer contact meta', async ({
      page,
    }) => {
      const MOCK_CONVO_1: MockConversation = {
        id: 'convo-takeover-111',
        bot_id: HANDOFF_BOT.id,
        bot_name: HANDOFF_BOT.name,
        state: 'manual_takeover',
        name: 'Michael Scott',
        email: 'michael@dundermifflin.com',
        phone: '+1 555-0199',
        snippet: 'I need to return paper reams',
        created_at: '2026-08-11T14:00:00Z',
        messages: [
          { role: 'user', content: 'I need to return paper reams' },
          { role: 'system', content: 'Chat transferred to customer support. A representative will join you shortly.' },
        ],
      };

      const MOCK_CONVO_2: MockConversation = {
        id: 'convo-takeover-222',
        bot_id: HANDOFF_BOT.id,
        bot_name: HANDOFF_BOT.name,
        state: 'manual_takeover',
        name: 'Dwight Schrute',
        email: 'dwight@dundermifflin.com',
        phone: '+1 555-0200',
        snippet: 'Question regarding beet seed delivery',
        created_at: '2026-08-11T15:30:00Z',
        messages: [
          { role: 'user', content: 'Question regarding beet seed delivery' },
          { role: 'system', content: 'Chat transferred to customer support. A representative will join you shortly.' },
        ],
      };

      await mockBotAPIs(page, {
        bot: HANDOFF_BOT,
        botsList: [HANDOFF_BOT],
        conversations: [MOCK_CONVO_1, MOCK_CONVO_2],
      });

      await page.goto('/admin/inbox', { waitUntil: 'domcontentloaded' });

      await expect(page.getByText('Active Handovers (2)')).toBeVisible({ timeout: 20000 });

      await expect(page.getByText('Michael Scott').first()).toBeVisible({ timeout: 15000 });
      await expect(page.getByText('Dwight Schrute').first()).toBeVisible({ timeout: 15000 });

      const statusBadges = page.locator('[data-testid="convo-status-badge"]');
      await expect(statusBadges).toHaveCount(2);
      await expect(statusBadges.first()).toHaveText(/manual_takeover/i);
      await expect(statusBadges.nth(1)).toHaveText(/manual_takeover/i);

      await expect(page.getByText('📧 michael@dundermifflin.com')).toBeVisible({ timeout: 15000 });
      await expect(page.getByText('📞 +1 555-0199')).toBeVisible({ timeout: 15000 });
      await expect(page.getByText('I need to return paper reams').first()).toBeVisible({ timeout: 15000 });

      await page.getByText('Dwight Schrute').first().click();

      await expect(page.getByText('📧 dwight@dundermifflin.com')).toBeVisible({ timeout: 15000 });
      await expect(page.getByText('📞 +1 555-0200')).toBeVisible({ timeout: 15000 });
      await expect(page.getByText('Question regarding beet seed delivery').first()).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe('E2E-4.2: Real-time Admin Reply', () => {
    const SUPPORT_BOT: Bot = {
      ...MOCK_BOT,
      id: 'b9999999-aaaa-bbbb-cccc-dddddddddddd',
      public_key: 'pk_realtime_support_888',
      name: 'Apex Live Support Agent',
      primary_color: '#2563eb',
      ecommerce_enabled: true,
    };

    test('Admin enters reply in /admin/inbox -> message appears immediately in public customer chat widget. Admin closes conversation -> conversation updates to closed.', async ({
      context,
    }) => {
      const sharedStore: MockConversation[] = [];
      let closedConversationId = '';

      await setSessionViaInitScript(context);
      await mockSupabaseAuth(context);
      await mockBotAPIs(context, {
        bot: SUPPORT_BOT,
        botsList: [SUPPORT_BOT],
        sharedStore,
        chatResponses: [
          "I am connecting you with our human support representative right away. [SHOW_SUPPORT_BUTTON]",
          "Message sent to customer support.",
        ],
        onAdminClose: (id) => {
          closedConversationId = id;
        },
      });

      const customerPage = await context.newPage();
      const adminPage = await context.newPage();

      await customerPage.goto(`/demo?botId=${SUPPORT_BOT.id}`, { waitUntil: 'domcontentloaded' });

      const launcherBtn = customerPage.locator('button').filter({ has: customerPage.locator('img[alt="chat"]') }).first();
      await expect(launcherBtn).toBeVisible({ timeout: 20000 });

      const customerWidget = customerPage.locator('#ai-widget').last();
      await expect(customerWidget).toBeAttached({ timeout: 20000 });

      await launcherBtn.click({ force: true });
      await expect(customerWidget).toHaveCSS('display', 'flex', { timeout: 15000 });

      const customerInput = customerWidget.locator('#ai-input');
      const customerSendBtn = customerWidget.locator('#bot-send-btn');
      const customerMessages = customerWidget.locator('#ai-messages');

      await expect(customerInput).toBeVisible({ timeout: 15000 });
      await expect(customerSendBtn).toBeVisible({ timeout: 15000 });

      await customerInput.fill('I have a critical issue with my subscription payment');
      await customerSendBtn.click();

      const handoffBtn = customerMessages.locator('button').filter({ hasText: /Talk to customer support/i }).first();
      await expect(handoffBtn).toBeVisible({ timeout: 15000 });
      await handoffBtn.click();

      await expect(
        customerMessages.getByText(/Connecting to support representative/i)
      ).toBeVisible({ timeout: 10000 });

      await adminPage.goto('/admin/inbox', { waitUntil: 'domcontentloaded' });

      await expect(adminPage.getByText(/Active Handovers/i)).toBeVisible({ timeout: 20000 });
      const statusBadge = adminPage.locator('[data-testid="convo-status-badge"]').first();
      await expect(statusBadge).toBeVisible({ timeout: 15000 });
      await expect(statusBadge).toHaveText(/manual_takeover/i);

      const adminReplyInput = adminPage.getByPlaceholder('Type your reply to customer...');
      await expect(adminReplyInput).toBeVisible({ timeout: 15000 });

      const adminReplyText = 'Hello! Support agent Alex here. I have refreshed your subscription and waived the pending fee.';
      await adminReplyInput.fill(adminReplyText);
      const adminSendBtn = adminReplyInput.locator('..').locator('button[type="submit"]');
      await adminSendBtn.click();

      await expect(adminReplyInput).toHaveValue('', { timeout: 10000 });

      await expect(
        customerMessages.getByText(adminReplyText)
      ).toBeVisible({ timeout: 15000 });

      const customerReplyText = 'Thank you Alex! That fixed the billing issue immediately.';
      await customerInput.fill(customerReplyText);
      await customerSendBtn.click();

      await expect(
        adminPage.getByText(customerReplyText).first()
      ).toBeVisible({ timeout: 15000 });

      const resolveBtn = adminPage.getByRole('button', { name: /Mark Resolved \/ Revert to AI/i });
      await expect(resolveBtn).toBeVisible({ timeout: 15000 });
      await resolveBtn.click();

      await expect.poll(() => Boolean(closedConversationId), { timeout: 15000 }).toBe(true);

      await expect(
        customerMessages.getByText(/The support session has ended\. Thank you!/i)
      ).toBeVisible({ timeout: 15000 });

      await expect(adminPage.getByText('No active support requests')).toBeVisible({ timeout: 15000 });

      await customerPage.close();
      await adminPage.close();
    });
  });
});
