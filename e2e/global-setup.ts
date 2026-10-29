import { chromium, type FullConfig } from '@playwright/test';

/**
 * `next dev` compiles each route the first time it is requested, both the server render and
 * the client chunks the browser then asks for. When that happens mid-test (e.g. clicking a
 * link to a page nothing has visited yet), the navigation can outlast the expect timeout under
 * parallel workers. Loading every page once in a real browser up front moves all that compile
 * time out of the tests; a plain fetch would only cover the server half. Dynamic segments get
 * a placeholder: the compile does not depend on the param value.
 */
const ROUTES = [
  '/',
  '/pricing',
  '/about',
  '/contact',
  '/login',
  '/signup',
  '/agent-mart',
  '/work-in-progress',
  '/admin',
  '/admin/new',
  '/admin/agent-creation',
  '/admin/bots',
  '/admin/bots/warmup',
  '/admin/bots/warmup/ingest',
  '/admin/bot/warmup/edit-bot',
  '/admin/inbox',
  '/admin/leads',
  '/admin/settings',
  '/admin/shopify',
  '/admin/shopify/bot',
  '/admin/shopify/leads',
  '/admin/shopify/training',
];

export default async function globalSetup(config: FullConfig) {
  if (process.env.PLAYWRIGHT_SKIP_WARMUP) return;

  const baseURL = config.projects[0]?.use.baseURL ?? 'http://localhost:3000';
  const started = Date.now();
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Sequential on purpose: parallel compiles starve each other and finish no sooner.
  for (const route of ROUTES) {
    try {
      await page.goto(new URL(route, baseURL).toString(), { waitUntil: 'load', timeout: 120_000 });
    } catch (err) {
      console.warn(`[warmup] ${route} failed: ${(err as Error).message}`);
    }
  }

  await browser.close();
  console.log(`[warmup] compiled ${ROUTES.length} routes in ${((Date.now() - started) / 1000).toFixed(1)}s`);
}
