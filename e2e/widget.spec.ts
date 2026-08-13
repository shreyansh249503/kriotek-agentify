import { test, expect } from '@playwright/test';
import { mockBotAPIs, MOCK_BOT, setSessionViaInitScript } from './bot-helpers';
import { mockSupabaseAuth } from './auth-helpers';
import { Bot } from '@/types/bot';

test.describe('Widget & Demo Playground Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setSessionViaInitScript(page);
    await mockSupabaseAuth(page);
  });

  test.describe('E2E-3.1: Widget Initialization (/demo or Embedded Frame)', () => {
    const CUSTOM_BRANDED_BOT: Bot = {
      ...MOCK_BOT,
      id: 'b3333333-4444-5555-6666-777777777777',
      public_key: 'pk_apex_brand_999',
      name: 'Apex Brand AI',
      primary_color: '#7c3aed',
      logo_url: 'https://bhyrxyzokssibgeznojo.supabase.co/storage/v1/object/public/logos/mock-uploaded-logo.png',
      ecommerce_enabled: true,
    };

    const EMBEDDED_BRANDED_BOT: Bot = {
      ...MOCK_BOT,
      id: 'b4444444-5555-6666-7777-888888888888',
      public_key: 'pk_embedded_brand_222',
      name: 'Apex Embedded Bot',
      primary_color: '#059669',
      logo_url: 'https://bhyrxyzokssibgeznojo.supabase.co/storage/v1/object/public/logos/mock-uploaded-logo.png',
      ecommerce_enabled: true,
    };

    test('should load public bot by publicKey on /demo, initialize widget script, and verify brand custom styling (primary color, logo, company name in header)', async ({
      page,
    }) => {
      await mockBotAPIs(page, {
        bot: CUSTOM_BRANDED_BOT,
        botsList: [CUSTOM_BRANDED_BOT],
      });

      await page.goto(`/demo?botId=${CUSTOM_BRANDED_BOT.id}`, { waitUntil: 'domcontentloaded' });

      const storeBrand = page.locator('div').filter({ hasText: /^Agentify\s*Store$/ }).first();
      await expect(storeBrand).toBeVisible({ timeout: 20000 });

      const launcherBtn = page.locator('button').filter({ has: page.locator('img[alt="chat"]') }).first();
      await expect(launcherBtn).toBeVisible({ timeout: 20000 });

      const launcherImg = launcherBtn.locator('img');
      await expect(launcherImg).toHaveAttribute('src', CUSTOM_BRANDED_BOT.logo_url as string);

      const widgetContainer = page.locator('#ai-widget').last();
      await expect(widgetContainer).toBeAttached({ timeout: 20000 });

      await launcherBtn.click({ force: true });

      await expect(widgetContainer).toHaveCSS('display', 'flex', { timeout: 15000 });

      const botHeader = widgetContainer.locator('#bot-header');
      await expect(botHeader).toBeVisible({ timeout: 15000 });

      await expect(botHeader).toHaveCSS('background-color', 'rgb(124, 58, 237)');

      const botNameEl = widgetContainer.locator('#bot-name');
      await expect(botNameEl).toHaveText('Apex Brand AI');

      const headerLogo = widgetContainer.locator('.bot-logo').first();
      await expect(headerLogo).toBeVisible({ timeout: 15000 });
      await expect(headerLogo).toHaveAttribute('src', CUSTOM_BRANDED_BOT.logo_url as string);

      const sendBtn = widgetContainer.locator('#bot-send-btn');
      await expect(sendBtn).toBeVisible();
      await expect(sendBtn).toHaveCSS('background-color', 'rgb(124, 58, 237)');

      await expect(widgetContainer.locator('#ai-menu-btn')).toBeVisible();
      await expect(widgetContainer.locator('#ai-close')).toBeVisible();
    });

    test('should initialize standalone widget in embedded iframe scenario with custom brand theme', async ({
      page,
    }) => {
      await mockBotAPIs(page, {
        bot: EMBEDDED_BRANDED_BOT,
        botsList: [EMBEDDED_BRANDED_BOT],
      });

      await page.goto('/work-in-progress', { waitUntil: 'domcontentloaded' });
      await page.evaluate((botPublicKey) => {
        const s = document.createElement('script');
        s.src = '/widget.js';
        s.setAttribute('bot-id', botPublicKey);
        document.body.appendChild(s);
      }, EMBEDDED_BRANDED_BOT.public_key);

      const launcherBtn = page.locator('button').filter({ has: page.locator('img[alt="chat"]') }).first();
      await expect(launcherBtn).toBeVisible({ timeout: 20000 });

      const launcherImg = launcherBtn.locator('img');
      await expect(launcherImg).toHaveAttribute('src', EMBEDDED_BRANDED_BOT.logo_url as string);

      const widgetContainer = page.locator('#ai-widget').last();
      await expect(widgetContainer).toBeAttached({ timeout: 20000 });

      await launcherBtn.click({ force: true });

      await expect(widgetContainer).toHaveCSS('display', 'flex', { timeout: 15000 });

      const botNameEl = widgetContainer.locator('#bot-name');
      await expect(botNameEl).toHaveText('Apex Embedded Bot');

      const botHeader = widgetContainer.locator('#bot-header');
      await expect(botHeader).toHaveCSS('background-color', 'rgb(5, 150, 105)');

      const headerLogo = widgetContainer.locator('.bot-logo').first();
      await expect(headerLogo).toHaveAttribute('src', EMBEDDED_BRANDED_BOT.logo_url as string);
    });
  });

  test.describe('E2E-3.2: Intelligent Contact Collection', () => {
    const LEAD_COLLECTION_BOT: Bot = {
      ...MOCK_BOT,
      id: 'b5555555-6666-7777-8888-999999999999',
      public_key: 'pk_lead_bot_333',
      name: 'Apex Concierge AI',
      primary_color: '#2563eb',
      contact_enabled: true,
      contact_prompt: 'Can we have your name and email so our team can follow up?',
      contact_email_message: 'Thanks for reaching out! Our team will contact you shortly.',
    };

    test('should prompt customer for missing contact details (name, email) upon inquiry and capture details into conversation state', async ({
      page,
    }) => {
      const chatCalls: { message: string; conversationId?: string; publicKey?: string }[] = [];

      await mockBotAPIs(page, {
        bot: LEAD_COLLECTION_BOT,
        botsList: [LEAD_COLLECTION_BOT],
        onChatMessage: (req) => {
          chatCalls.push(req);
        },
        chatResponses: [
          "I'd be glad to provide detailed pricing for our enterprise plan. Could you please share your name and email address so our sales team can contact you?",
          "Thank you John Doe! I have captured your email (john.doe@example.com). Our team will reach out to you within 24 hours.",
        ],
      });

      await page.goto(`/demo?botId=${LEAD_COLLECTION_BOT.id}`, { waitUntil: 'domcontentloaded' });

      const launcherBtn = page.locator('button').filter({ has: page.locator('img[alt="chat"]') }).first();
      await expect(launcherBtn).toBeVisible({ timeout: 20000 });

      const widgetContainer = page.locator('#ai-widget').last();
      await expect(widgetContainer).toBeAttached({ timeout: 20000 });

      await launcherBtn.click({ force: true });
      await expect(widgetContainer).toHaveCSS('display', 'flex', { timeout: 15000 });

      const chatInput = widgetContainer.locator('#ai-input');
      const sendButton = widgetContainer.locator('#bot-send-btn');
      const messagesContainer = widgetContainer.locator('#ai-messages');

      await expect(chatInput).toBeVisible({ timeout: 10000 });

      await chatInput.fill('I need an enterprise quotation for 50 licenses.');
      await sendButton.click();

      await expect(messagesContainer.getByText('I need an enterprise quotation for 50 licenses.')).toBeVisible({
        timeout: 10000,
      });

      await expect(
        messagesContainer.getByText(/Could you please share your name and email address/i)
      ).toBeVisible({ timeout: 15000 });

      expect(chatCalls.length).toBe(1);
      expect(chatCalls[0].message).toBe('I need an enterprise quotation for 50 licenses.');
      expect(chatCalls[0].publicKey).toBe(LEAD_COLLECTION_BOT.public_key);
      const conversationId = chatCalls[0].conversationId;
      expect(conversationId).toBeTruthy();

      await chatInput.fill('My name is John Doe and my email is john.doe@example.com');
      await sendButton.click();

      await expect(
        messagesContainer.getByText('My name is John Doe and my email is john.doe@example.com')
      ).toBeVisible({ timeout: 10000 });

      await expect(
        messagesContainer.getByText(/Thank you John Doe! I have captured your email \(john\.doe@example\.com\)/i)
      ).toBeVisible({ timeout: 15000 });

      expect(chatCalls.length).toBe(2);
      expect(chatCalls[1].message).toBe('My name is John Doe and my email is john.doe@example.com');
      expect(chatCalls[1].conversationId).toBe(conversationId);
    });

    test('should capture contact details directly when provided in initial customer message', async ({
      page,
    }) => {
      const chatCalls: { message: string; conversationId?: string; publicKey?: string }[] = [];

      await mockBotAPIs(page, {
        bot: LEAD_COLLECTION_BOT,
        botsList: [LEAD_COLLECTION_BOT],
        onChatMessage: (req) => {
          chatCalls.push(req);
        },
        chatResponses: [
          "Thanks Alice Smith! I have recorded your email (alice@example.com). Our partnership team will follow up shortly.",
        ],
      });

      await page.goto(`/demo?botId=${LEAD_COLLECTION_BOT.id}`, { waitUntil: 'domcontentloaded' });

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

      await chatInput.fill('Hi, my name is Alice Smith, please reach out to alice@example.com regarding partnerships.');
      await sendButton.click();

      await expect(
        messagesContainer.getByText('Hi, my name is Alice Smith, please reach out to alice@example.com regarding partnerships.')
      ).toBeVisible({ timeout: 10000 });

      await expect(
        messagesContainer.getByText(/Thanks Alice Smith! I have recorded your email \(alice@example\.com\)/i)
      ).toBeVisible({ timeout: 15000 });

      expect(chatCalls.length).toBe(1);
      expect(chatCalls[0].message).toContain('alice@example.com');
    });
  });

  test.describe('E2E-3.3: E-Commerce Product Recommendation', () => {
    const ECOMMERCE_BOT: Bot = {
      ...MOCK_BOT,
      id: 'b6666666-7777-8888-9999-000000000000',
      public_key: 'pk_ecommerce_bot_444',
      name: 'Apex Storefront AI',
      primary_color: '#0284c7',
      ecommerce_enabled: true,
      ecommerce_prompt: 'Recommend top products from our catalog.',
      ecommerce_products: [
        {
          name: 'Apex Pro Wireless Headphones',
          price: '$199.99',
          url: 'https://example.com/products/apex-headphones',
          image: 'https://example.com/images/headphones.jpg',
        },
        {
          name: 'Apex Smart Watch Ultra',
          price: '$249.00',
          url: 'https://example.com/products/apex-smartwatch',
          image: 'https://example.com/images/smartwatch.jpg',
        },
      ],
    };

    test('should render multi-product carousel with product cards, images, prices, and direct shop links upon customer inquiry', async ({
      page,
    }) => {
      const carouselPayload = `Here are our top recommended items for audio and fitness:\n\n<product-carousel>\n[\n  {\n    "name": "Apex Pro Wireless Headphones",\n    "price": "$199.99",\n    "image": "https://example.com/images/headphones.jpg",\n    "url": "https://example.com/products/apex-headphones"\n  },\n  {\n    "name": "Apex Smart Watch Ultra",\n    "price": "$249.00",\n    "image": "https://example.com/images/smartwatch.jpg",\n    "url": "https://example.com/products/apex-smartwatch"\n  }\n]\n</product-carousel>`;

      await mockBotAPIs(page, {
        bot: ECOMMERCE_BOT,
        botsList: [ECOMMERCE_BOT],
        chatResponses: [carouselPayload],
      });

      await page.goto(`/demo?botId=${ECOMMERCE_BOT.id}`, { waitUntil: 'domcontentloaded' });

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

      await chatInput.fill('Can you recommend top products for audio and workouts?');
      await sendButton.click();

      await expect(
        messagesContainer.getByText('Can you recommend top products for audio and workouts?')
      ).toBeVisible({ timeout: 10000 });

      const carouselWrapper = messagesContainer.locator('.carousel-wrapper').first();
      await expect(carouselWrapper).toBeVisible({ timeout: 15000 });

      const prevBtn = carouselWrapper.locator('.carousel-nav-btn.prev');
      const nextBtn = carouselWrapper.locator('.carousel-nav-btn.next');
      await expect(prevBtn).toBeVisible();
      await expect(nextBtn).toBeVisible();

      const productCards = carouselWrapper.locator('.product-card');
      await expect(productCards).toHaveCount(2);

      const card1 = productCards.nth(0);
      await expect(card1.locator('.product-name')).toHaveText('Apex Pro Wireless Headphones');
      await expect(card1.locator('.product-price')).toHaveText('$199.99');
      const img1 = card1.locator('.product-image');
      await expect(img1).toHaveAttribute('src', 'https://example.com/images/headphones.jpg');
      await expect(img1).toHaveAttribute('alt', 'Apex Pro Wireless Headphones');
      const link1 = card1.locator('a.product-action');
      await expect(link1).toHaveAttribute('href', 'https://example.com/products/apex-headphones');
      await expect(link1).toHaveAttribute('target', '_blank');
      await expect(link1).toHaveText('View Details');

      const card2 = productCards.nth(1);
      await expect(card2.locator('.product-name')).toHaveText('Apex Smart Watch Ultra');
      await expect(card2.locator('.product-price')).toHaveText('$249.00');
      const img2 = card2.locator('.product-image');
      await expect(img2).toHaveAttribute('src', 'https://example.com/images/smartwatch.jpg');
      await expect(img2).toHaveAttribute('alt', 'Apex Smart Watch Ultra');
      const link2 = card2.locator('a.product-action');
      await expect(link2).toHaveAttribute('href', 'https://example.com/products/apex-smartwatch');
      await expect(link2).toHaveAttribute('target', '_blank');
      await expect(link2).toHaveText('View Details');
    });

    test('should render single product card layout without navigation arrows when exactly one product is recommended', async ({
      page,
    }) => {
      const singleProductPayload = `Here is our top featured wireless headset:\n\n<product-carousel>\n[\n  {\n    "name": "Apex Pro Wireless Headphones",\n    "price": "$199.99",\n    "image": "https://example.com/images/headphones.jpg",\n    "url": "https://example.com/products/apex-headphones"\n  }\n]\n</product-carousel>`;

      await mockBotAPIs(page, {
        bot: ECOMMERCE_BOT,
        botsList: [ECOMMERCE_BOT],
        chatResponses: [singleProductPayload],
      });

      await page.goto(`/demo?botId=${ECOMMERCE_BOT.id}`, { waitUntil: 'domcontentloaded' });

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

      await chatInput.fill('Show me your best wireless headphones.');
      await sendButton.click();

      const carouselWrapper = messagesContainer.locator('.carousel-wrapper.single-wrapper').first();
      await expect(carouselWrapper).toBeVisible({ timeout: 15000 });

      const singleCarousel = carouselWrapper.locator('.product-carousel.single-product');
      await expect(singleCarousel).toBeVisible();

      await expect(carouselWrapper.locator('.carousel-nav-btn')).toHaveCount(0);

      const productCard = singleCarousel.locator('.product-card');
      await expect(productCard).toHaveCount(1);
      await expect(productCard.locator('.product-name')).toHaveText('Apex Pro Wireless Headphones');
      await expect(productCard.locator('.product-price')).toHaveText('$199.99');
      await expect(productCard.locator('a.product-action')).toHaveAttribute(
        'href',
        'https://example.com/products/apex-headphones'
      );
    });
  });

  test.describe('E2E-3.4: Shopify Order Lookup (lookup_shopify_order Tool)', () => {
    const SHOPIFY_BOT: Bot = {
      ...MOCK_BOT,
      id: 'b7777777-8888-9999-aaaa-bbbbbbbbbbbb',
      public_key: 'pk_shopify_order_555',
      name: 'Apex Order Support AI',
      primary_color: '#0d9488',
      ecommerce_enabled: true,
    };

    test('should prompt for contact verification on order query, execute lookup_shopify_order, and render friendly tracking journey card', async ({
      page,
    }) => {
      const chatCalls: { message: string; conversationId?: string; publicKey?: string }[] = [];

      const orderJourneyTag = `[ORDER_JOURNEY_JSON:{"orderNumber":"#1001","orderDate":"August 10, 2026","email":"customer@example.com","statusBadge":"In Transit","currentStep":4,"statusDescription":"Your order has been shipped with FedEx and is out for delivery today.","shippingAddress":"742 Evergreen Terrace, Springfield, OR","tracking":{"url":"https://www.fedex.com/fedextrack/?trknbr=9876543210","company":"FedEx","number":"9876543210"},"items":[{"name":"Apex Pro Wireless Headphones","quantity":1,"price":"199.99","currency":"$","image":"https://example.com/images/headphones.jpg"}],"totalPrice":"199.99","currency":"$"}]`;

      await mockBotAPIs(page, {
        bot: SHOPIFY_BOT,
        botsList: [SHOPIFY_BOT],
        onChatMessage: (req) => {
          chatCalls.push(req);
        },
        chatResponses: [
          "I'd be happy to check the status of order #1001 for you! For security verification, could you please provide the email address or phone number associated with this order?",
          `Great news! Your order #1001 has shipped and is currently in transit with FedEx.\n\n${orderJourneyTag}`,
        ],
      });

      await page.goto(`/demo?botId=${SHOPIFY_BOT.id}`, { waitUntil: 'domcontentloaded' });

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

      await chatInput.fill('Where is my order #1001?');
      await sendButton.click();

      await expect(messagesContainer.getByText('Where is my order #1001?')).toBeVisible({ timeout: 10000 });

      await expect(
        messagesContainer.getByText(/could you please provide the email address or phone number associated with this order/i)
      ).toBeVisible({ timeout: 15000 });

      expect(chatCalls.length).toBe(1);
      expect(chatCalls[0].message).toBe('Where is my order #1001?');
      const conversationId = chatCalls[0].conversationId;
      expect(conversationId).toBeTruthy();

      await chatInput.fill('My email is customer@example.com');
      await sendButton.click();

      await expect(messagesContainer.getByText('My email is customer@example.com')).toBeVisible({ timeout: 10000 });

      await expect(
        messagesContainer.getByText(/Your order #1001 has shipped and is currently in transit with FedEx/i)
      ).toBeVisible({ timeout: 15000 });

      const journeyCard = messagesContainer.locator('.order-journey-card-container').first();
      await expect(journeyCard).toBeVisible({ timeout: 15000 });

      await expect(journeyCard.getByText('Order #1001')).toBeVisible();
      await expect(journeyCard.getByText(/Placed on August 10, 2026/i)).toBeVisible();
      await expect(journeyCard.getByText(/customer@example.com/i)).toBeVisible();
      await expect(journeyCard.getByText('In Transit')).toBeVisible();

      await expect(journeyCard.getByText('Placed', { exact: true })).toBeVisible();
      await expect(journeyCard.getByText('Paid', { exact: true })).toBeVisible();
      await expect(journeyCard.getByText('Packed', { exact: true })).toBeVisible();
      await expect(journeyCard.getByText('Shipped', { exact: true })).toBeVisible();
      await expect(journeyCard.getByText('Delivered', { exact: true })).toBeVisible();

      await expect(
        journeyCard.getByText('Your order has been shipped with FedEx and is out for delivery today.')
      ).toBeVisible();
      await expect(journeyCard.getByText(/742 Evergreen Terrace, Springfield, OR/i)).toBeVisible();

      const trackBtn = journeyCard.locator('a[href*="fedex.com"]');
      await expect(trackBtn).toBeVisible();
      await expect(trackBtn).toContainText('Track Package (FedEx #9876543210)');

      await expect(journeyCard.getByText('Apex Pro Wireless Headphones')).toBeVisible();
      await expect(journeyCard.getByText(/Qty: 1 × \$ 199.99/i)).toBeVisible();
      await expect(journeyCard.getByText('Total: $ 199.99')).toBeVisible();

      expect(chatCalls.length).toBe(2);
      expect(chatCalls[1].message).toBe('My email is customer@example.com');
      expect(chatCalls[1].conversationId).toBe(conversationId);
    });

    test('should handle order not found or verification failure gracefully', async ({
      page,
    }) => {
      await mockBotAPIs(page, {
        bot: SHOPIFY_BOT,
        botsList: [SHOPIFY_BOT],
        chatResponses: [
          "I looked up order #9999 for invalid@example.com, but couldn't find any matching records. Please verify your order number or contact our support team.",
        ],
      });

      await page.goto(`/demo?botId=${SHOPIFY_BOT.id}`, { waitUntil: 'domcontentloaded' });

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

      await chatInput.fill('Where is order #9999 for invalid@example.com?');
      await sendButton.click();

      await expect(
        messagesContainer.getByText("I looked up order #9999 for invalid@example.com, but couldn't find any matching records. Please verify your order number or contact our support team.")
      ).toBeVisible({ timeout: 15000 });

      await expect(messagesContainer.locator('.order-journey-card-container')).toHaveCount(0);
    });
  });
});
