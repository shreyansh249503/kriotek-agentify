import { Page } from '@playwright/test';
import { Bot } from '@/types/bot';
import { SUPABASE_STORAGE_KEY, MOCK_SESSION } from './auth-helpers';

export async function setSessionViaInitScript(page: Page) {
  await page.addInitScript(
    ({ key, session }) => {
      window.localStorage.setItem(key, JSON.stringify(session));
    },
    { key: SUPABASE_STORAGE_KEY, session: MOCK_SESSION }
  );
}

export const MOCK_BOT: Bot = {
  id: 'b1111111-2222-3333-4444-555555555555',
  public_key: 'pk_test_bot_12345',
  user_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  name: 'Support Assistant',
  description: 'AI customer support assistant for inquiries and orders.',
  tone: 'friendly',
  primary_color: '#4f46e5',
  contact_enabled: true,
  contact_email: 'leads@example.com',
  contact_prompt: 'Would you like us to contact you for more details?',
  contact_email_message: 'Thanks for reaching out! Our team will contact you shortly.',
  logo_url: '',
  ecommerce_enabled: true,
  ecommerce_prompt: 'Pitch our wireless headphones on checkout.',
  ecommerce_products: [
    {
      name: 'Wireless Headphones',
      price: '$99.00',
      url: 'https://example.com/products/headphones',
      image: 'https://example.com/images/headphones.jpg',
    },
  ],
  created_at: '2026-08-10T00:00:00.000Z',
  updated_at: '2026-08-10T00:00:00.000Z',
};

export async function mockBotAPIs(
  page: Page,
  options?: {
    bot?: Partial<Bot>;
    botsList?: Bot[];
    onCreateSuccess?: (data: unknown) => void;
    onUpdateSuccess?: (data: unknown) => void;
    chatResponses?: (string | ((req: { message: string; conversationId?: string; publicKey?: string }) => string))[];
    onChatMessage?: (req: { message: string; conversationId?: string; publicKey?: string }) => void;
  }
) {
  let currentBot: Bot = { ...MOCK_BOT, ...(options?.bot || {}) };
  const botsList = options?.botsList || [currentBot];

  // Mock Supabase PostgREST table queries for bots
  await page.route('**/rest/v1/bots*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(currentBot),
    });
  });

  // Mock GET/POST /api/bots
  await page.route('**/api/bots', async (route) => {
    if (route.request().method() === 'POST') {
      const postData = route.request().postDataJSON() || {};
      const newBot: Bot = {
        ...currentBot,
        ...postData,
        id: 'b2222222-3333-4444-5555-666666666666',
        public_key: 'pk_newly_created_bot',
      };
      if (options?.onCreateSuccess) {
        options.onCreateSuccess(postData);
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(newBot),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(botsList),
      });
    }
  });

  // Mock GET/PUT /api/bots/*
  await page.route('**/api/bots/*', async (route) => {
    if (route.request().method() === 'PUT') {
      const putData = route.request().postDataJSON() || {};
      currentBot = {
        ...currentBot,
        ...putData,
        updated_at: new Date().toISOString(),
      };
      if (options?.onUpdateSuccess) {
        options.onUpdateSuccess(putData);
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(currentBot),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(currentBot),
      });
    }
  });

  // Mock /api/analytics
  await page.route('**/api/analytics*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        totals: {
          total_leads: 12,
          total_conversations: 45,
          total_messages: 180,
        },
        convosPerBot: [],
        leadsPerBot: [],
        monthlyTrend: [],
      }),
    });
  });

  // Mock /api/upload
  await page.route('**/api/upload*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        url: 'https://bhyrxyzokssibgeznojo.supabase.co/storage/v1/object/public/logos/mock-uploaded-logo.png',
      }),
    });
  });

  // Mock logo and product image binary downloads to avoid network timeouts
  await page.route(/(mock-uploaded-logo\.png|headphones\.jpg|smartwatch\.jpg|mock-.*\.png|mock-.*\.jpg|\/images\/.*\.jpg)/, async (route) => {
    const pngPixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    await route.fulfill({
      status: 200,
      contentType: 'image/png',
      body: pngPixel,
    });
  });

  // Mock /api/ingest-url
  await page.route('**/api/ingest-url*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        chunksIngested: 12,
        productsExtractedCount: 4,
      }),
    });
  });

  // Mock /api/ingest-pdf
  await page.route('**/api/ingest-pdf*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        chunks: 18,
      }),
    });
  });

  // Mock /api/ingest (raw text)
  await page.route('**/api/ingest', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        chunks: 6,
      }),
    });
  });

  // Mock /api/public/bot/* (used by widget.js)
  await page.route('**/api/public/bot/*', async (route) => {
    const url = route.request().url();
    const pubKey = url.split('/api/public/bot/')[1]?.split('?')[0];
    const targetBot = (options?.botsList || []).find((b) => b.public_key === pubKey) || currentBot;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        name: targetBot.name,
        primary_color: targetBot.primary_color,
        logo_url: targetBot.logo_url || null,
        ecommerce_enabled: targetBot.ecommerce_enabled,
        supabaseUrl: null,
        supabaseAnonKey: null,
      }),
    });
  });

  // Mock /api/public/history (used by widget.js)
  await page.route('**/api/public/history*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify([]),
    });
  });

  // Mock /api/public/conversation/*
  await page.route('**/api/public/conversation/*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ messages: [] }),
    });
  });

  // Mock /api/chat
  let chatCallIndex = 0;
  await page.route('**/api/chat*', async (route) => {
    let postData: { message?: string; conversationId?: string; publicKey?: string } = {};
    try {
      postData = route.request().postDataJSON() || {};
    } catch (e) {}

    if (options?.onChatMessage) {
      options.onChatMessage(postData as { message: string; conversationId?: string; publicKey?: string });
    }

    let responseText = "Hello! How can I help you today?";
    if (options?.chatResponses && options.chatResponses.length > 0) {
      const respItem = options.chatResponses[Math.min(chatCallIndex, options.chatResponses.length - 1)];
      responseText = typeof respItem === 'function' ? respItem(postData as { message: string; conversationId?: string; publicKey?: string }) : respItem;
      chatCallIndex++;
    }

    await route.fulfill({
      status: 200,
      contentType: 'text/plain',
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: responseText,
    });
  });
}
