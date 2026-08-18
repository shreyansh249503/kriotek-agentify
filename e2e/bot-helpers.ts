import { Page, BrowserContext } from '@playwright/test';
import { Bot } from '@/types/bot';
import { SUPABASE_STORAGE_KEY, MOCK_SESSION } from './auth-helpers';

export async function setSessionViaInitScript(target: Page | BrowserContext) {
  await target.addInitScript(
    ({ key, session }: { key: string; session: typeof MOCK_SESSION }) => {
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

export interface MockLead {
  id: string;
  bot_id?: string;
  bot_name?: string;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
}

export const MOCK_LEADS: MockLead[] = [
  {
    id: "lead-101",
    bot_id: "b1111111-2222-3333-4444-555555555555",
    bot_name: "Support Assistant",
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    phone: "+1 (555) 234-5678",
    created_at: "2026-08-11T14:30:00.000Z",
  },
  {
    id: "lead-102",
    bot_id: "b1111111-2222-3333-4444-555555555555",
    bot_name: "Support Assistant",
    name: "Bob Williams",
    email: "bob.williams@example.com",
    phone: "+1 (555) 876-5432",
    created_at: "2026-08-10T09:15:00.000Z",
  },
  {
    id: "lead-103",
    bot_id: "b1111111-2222-3333-4444-555555555555",
    bot_name: "Sales Pro Bot",
    name: "Charlie Davis",
    email: "charlie.davis@example.com",
    phone: "+1 (555) 345-6789",
    created_at: "2026-08-08T18:45:00.000Z",
  },
  {
    id: "lead-104",
    bot_id: "b1111111-2222-3333-4444-555555555555",
    bot_name: "Support Assistant",
    name: "Diana Prince",
    email: "diana.prince@themyscira.com",
    phone: "+1 (555) 999-1111",
    created_at: "2026-07-25T11:00:00.000Z",
  },
];

export interface MockConversation {
  id: string;
  bot_id: string;
  bot_name?: string;
  state: string;
  name?: string;
  email?: string;
  phone?: string;
  snippet?: string;
  created_at: string;
  messages: Array<{
    role: "user" | "assistant" | "system";
    sender?: "ai" | "human";
    content: string;
  }>;
}

export async function mockBotAPIs(
  page: Page | BrowserContext,
  options?: {
    bot?: Partial<Bot>;
    botsList?: Bot[];
    conversations?: MockConversation[];
    sharedStore?: MockConversation[];
    leadsList?: MockLead[];
    sharedLeadsStore?: MockLead[];
    onCreateSuccess?: (data: unknown) => void;
    onUpdateSuccess?: (data: unknown) => void;
    onSwitchToManual?: (data: { conversationId: string; publicKey: string }) => void;
    onAdminReply?: (data: { id: string; message: string }) => void;
    onAdminClose?: (id: string) => void;
    onLeadCreated?: (lead: MockLead) => void;
    chatResponses?: (
      | string
      | { status: number; body?: string; error?: string }
      | ((req: { message: string; conversationId?: string; publicKey?: string }) => string | { status: number; body?: string; error?: string })
    )[];
    onChatMessage?: (req: { message: string; conversationId?: string; publicKey?: string }) => void;
    analytics?:
      | Record<string, unknown>
      | ((context: {
          conversations: MockConversation[];
          leads: MockLead[];
          bots: Bot[];
        }) => unknown);
  }
) {
  let currentBot: Bot = { ...MOCK_BOT, ...(options?.bot || {}) };
  const botsList = options?.botsList || [currentBot];
  const conversationsStore: MockConversation[] = options?.sharedStore
    ? options.sharedStore
    : (options?.conversations || []).map((c) => ({
        ...c,
        messages: [...(c.messages || [])],
      }));
  const leadsStore: MockLead[] = options?.sharedLeadsStore
    ? options.sharedLeadsStore
    : [...(options?.leadsList ?? MOCK_LEADS)];


  await page.route('**/rest/v1/bots*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(currentBot),
    });
  });

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

  await page.route('**/api/leads*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(leadsStore),
    });
  });

  await page.route('**/api/analytics*', async (route) => {
    let analyticsPayload;
    if (typeof options?.analytics === 'function') {
      analyticsPayload = options.analytics({
        conversations: conversationsStore,
        leads: leadsStore,
        bots: botsList,
      });
    } else if (options?.analytics) {
      analyticsPayload = options.analytics;
    } else {
      const convosPerBot = botsList.map((b) => {
        const count = conversationsStore.filter((c) => c.bot_id === b.id).length;
        return {
          bot_id: b.id,
          bot_name: b.name,
          total_conversations: count,
          total_messages: count * 4,
        };
      });

      const leadsPerBot = botsList.map((b) => {
        const count = leadsStore.filter((l) => l.bot_id === b.id).length;
        return {
          bot_id: b.id,
          bot_name: b.name,
          total_leads: count,
        };
      });

      const totalConvos = conversationsStore.length || 45;
      const totalLeads = leadsStore.length || 12;
      const totalMessages =
        conversationsStore.reduce(
          (sum, c) => sum + (c.messages?.length || 0),
          0
        ) || 180;

      analyticsPayload = {
        totals: {
          total_leads: totalLeads,
          total_conversations: totalConvos,
          total_messages: totalMessages,
        },
        convosPerBot: convosPerBot.filter((c) => c.total_conversations > 0),
        leadsPerBot: leadsPerBot.filter((l) => l.total_leads > 0),
        monthlyTrend: [
          { month: "Jun 26", conversations: 25, leads: 5 },
          { month: "Jul 26", conversations: 35, leads: 8 },
          { month: "Aug 26", conversations: totalConvos, leads: totalLeads },
        ],
      };
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(analyticsPayload),
    });
  });

  await page.route('**/api/upload*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        url: 'https://bhyrxyzokssibgeznojo.supabase.co/storage/v1/object/public/logos/mock-uploaded-logo.png',
      }),
    });
  });

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

  await page.route('**/api/chat/switch-to-manual*', async (route) => {
    const postData = route.request().postDataJSON() || {};
    const { conversationId } = postData;
    if (options?.onSwitchToManual) {
      options.onSwitchToManual(postData);
    }

    let existingConvo = conversationsStore.find((c) => c.id === conversationId);
    if (!existingConvo) {
      existingConvo = {
        id: conversationId || 'convo-' + Date.now(),
        bot_id: currentBot.id,
        bot_name: currentBot.name,
        state: 'manual_takeover',
        name: 'Jane Customer',
        email: 'customer@example.com',
        snippet: 'Customer requested live support',
        created_at: new Date().toISOString(),
        messages: [
          { role: 'user', content: 'I need human assistance' },
          { role: 'system', content: 'Chat transferred to customer support. A representative will join you shortly.' },
        ],
      };
      conversationsStore.unshift(existingConvo);
    } else {
      existingConvo.state = 'manual_takeover';
      existingConvo.messages.push({
        role: 'system',
        content: 'Chat transferred to customer support. A representative will join you shortly.',
      });
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ success: true, state: 'manual_takeover' }),
    });
  });

  await page.route('**/api/admin/conversations/*/reply', async (route) => {
    const url = route.request().url();
    const match = url.match(/\/api\/admin\/conversations\/([^/]+)\/reply/);
    const id = match ? match[1] : '';
    const { message } = route.request().postDataJSON() || {};

    if (options?.onAdminReply) {
      options.onAdminReply({ id, message });
    }

    const convo = conversationsStore.find((c) => c.id === id);
    if (convo) {
      convo.messages.push({
        role: 'assistant',
        sender: 'human',
        content: message,
      });
      convo.snippet = message;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ success: true }),
    });
  });

  await page.route('**/api/admin/conversations/*/close', async (route) => {
    const url = route.request().url();
    const match = url.match(/\/api\/admin\/conversations\/([^/]+)\/close/);
    const id = match ? match[1] : '';

    if (options?.onAdminClose) {
      options.onAdminClose(id);
    }

    const convo = conversationsStore.find((c) => c.id === id);
    if (convo) {
      convo.state = 'completed';
      convo.messages.push({
        role: 'system',
        content: 'The support session has ended. Thank you!',
      });
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ success: true }),
    });
  });

  await page.route(/\/api\/admin\/conversations\/[a-zA-Z0-9_-]+$/, async (route) => {
    const url = route.request().url();
    const id = url.split('/api/admin/conversations/')[1]?.split('?')[0];
    const convo = conversationsStore.find((c) => c.id === id);

    if (convo) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          state: convo.state,
          messages: convo.messages,
        }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          state: 'manual_takeover',
          messages: [],
        }),
      });
    }
  });

  await page.route(/\/api\/admin\/conversations(\?.*)?$/, async (route) => {
    const activeConvos = conversationsStore
      .filter((c) => c.state === 'manual' || c.state === 'manual_takeover')
      .map((c) => ({
        id: c.id,
        bot_id: c.bot_id,
        bot_name: c.bot_name || currentBot.name,
        state: c.state,
        name: c.name || 'Anonymous Guest',
        email: c.email,
        phone: c.phone,
        snippet: c.snippet || (c.messages.length > 0 ? c.messages[c.messages.length - 1].content : 'Opened live chat...'),
        created_at: c.created_at,
      }));

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(activeConvos),
    });
  });

  await page.route('**/api/public/conversation/*', async (route) => {
    const url = route.request().url();
    const id = url.split('/api/public/conversation/')[1]?.split('?')[0];
    const convo = conversationsStore.find((c) => c.id === id);

    if (convo) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          state: convo.state,
          messages: convo.messages,
        }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ state: 'idle', messages: [] }),
      });
    }
  });

  let chatCallIndex = 0;
  await page.route('**/api/chat*', async (route) => {
    let postData: { message?: string; conversationId?: string; publicKey?: string } = {};
    try {
      postData = route.request().postDataJSON() || {};
    } catch {}

    if (options?.onChatMessage) {
      options.onChatMessage(postData as { message: string; conversationId?: string; publicKey?: string });
    }

    if (postData.conversationId && postData.message) {
      let convo = conversationsStore.find((c) => c.id === postData.conversationId);
      if (!convo) {
        convo = {
          id: postData.conversationId,
          bot_id: currentBot.id,
          bot_name: currentBot.name,
          state: 'idle',
          name: 'Jane Customer',
          email: 'customer@example.com',
          snippet: postData.message,
          created_at: new Date().toISOString(),
          messages: [{ role: 'user', content: postData.message }],
        };
        conversationsStore.unshift(convo);
      } else {
        convo.messages.push({ role: 'user', content: postData.message });
        convo.snippet = postData.message;
      }
    }

    const convo = postData.conversationId ? conversationsStore.find((c) => c.id === postData.conversationId) : null;
    const isManual = convo && (convo.state === 'manual' || convo.state === 'manual_takeover');

    let respItem:
      | string
      | { status: number; body?: string; error?: string }
      | undefined = undefined;

    if (!isManual && options?.chatResponses && options.chatResponses.length > 0) {
      const rawResp = options.chatResponses[Math.min(chatCallIndex, options.chatResponses.length - 1)];
      respItem = typeof rawResp === 'function' ? rawResp(postData as { message: string; conversationId?: string; publicKey?: string }) : rawResp;
      chatCallIndex++;
    }

    if (typeof respItem === 'object' && respItem !== null && 'status' in respItem) {
      const status = respItem.status;
      const body = respItem.body || respItem.error || (status === 429 ? 'Too Many Requests' : 'Internal Server Error');
      await route.fulfill({
        status,
        contentType: 'text/plain',
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body,
      });
      return;
    }

    const responseText = isManual
      ? "Message sent to customer support."
      : typeof respItem === 'string'
      ? respItem
      : "Hello! How can I help you today?";

    if (convo && !isManual && responseText) {
      convo.messages.push({ role: 'assistant', content: responseText });
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

