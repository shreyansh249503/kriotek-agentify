import { test, expect } from '@playwright/test';
import {
  MOCK_USER,
  mockSupabaseAuth,
} from './auth-helpers';
import { setSessionViaInitScript } from './bot-helpers';

test.describe('Landing Page & Conversion Flow', () => {
  test.describe('E2E-8.1: Landing Page & Hero Conversion (/)', () => {
    test('should render hero headline, sub-headline, conversion value tags, and live chat preview widget mockup', async ({
      page,
    }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      const heroHeadline = page.getByRole('heading', { level: 1 });
      await expect(heroHeadline).toBeVisible({ timeout: 15000 });
      await expect(heroHeadline).toContainText('Build AI Agents.');
      await expect(heroHeadline).toContainText('That Delivers');
      await expect(heroHeadline).toContainText('Results.');

      const subHeadline = page.getByText(
        /Agentify AI agents engage visitors, qualify leads, answer questions/i
      );
      await expect(subHeadline).toBeVisible({ timeout: 15000 });
      await expect(subHeadline).toContainText('No coding Just Results.');

      await expect(page.getByText('Capture Leads')).toBeVisible();
      await expect(page.getByText('Qualify Instantly')).toBeVisible();
      await expect(page.getByText('Close more Deals')).toBeVisible();

      const chatPreviewImg = page.getByAltText('Chat bot Preview');
      await expect(chatPreviewImg).toBeVisible({ timeout: 15000 });
    });

    test('should redirect header "Try for Free" CTA to /signup', async ({
      page,
    }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      const headerTryForFree = page.locator('header').getByRole('link', { name: 'Try for Free' });
      await expect(headerTryForFree).toBeVisible({ timeout: 15000 });
      await headerTryForFree.click();

      await expect(page).toHaveURL(/\/signup/, { timeout: 10000 });
      await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible({ timeout: 10000 });
    });

    test('should redirect hero primary CTA button "Built Your Free Agent" to /signup', async ({
      page,
    }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      const heroSignupBtn = page.getByRole('link', { name: 'Built Your Free Agent' });
      await expect(heroSignupBtn).toBeVisible({ timeout: 15000 });
      await heroSignupBtn.click();

      await expect(page).toHaveURL(/\/signup/, { timeout: 10000 });
      await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible({ timeout: 10000 });
    });

    test('should redirect final bottom CTA "Build your agent for free" to /signup', async ({
      page,
    }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      const finalCtaBtn = page.getByRole('link', { name: 'Build your agent for free' });
      await expect(finalCtaBtn).toBeVisible({ timeout: 15000 });
      await finalCtaBtn.click();

      await expect(page).toHaveURL(/\/signup/, { timeout: 10000 });
      await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible({ timeout: 10000 });
    });

    test('should redirect header "Sign in" CTA to /login', async ({
      page,
    }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      const headerSignIn = page.locator('header').getByRole('link', { name: 'Sign in' });
      await expect(headerSignIn).toBeVisible({ timeout: 15000 });
      await headerSignIn.click();

      await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
      await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible({ timeout: 15000 });
    });

    test('should redirect hero "Watch Demo" CTA to /agent-mart', async ({
      page,
    }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      const watchDemoBtn = page.getByRole('link', { name: 'Watch Demo' });
      await expect(watchDemoBtn).toBeVisible({ timeout: 15000 });
      await watchDemoBtn.click();

      await expect(page).toHaveURL(/\/agent-mart/, { timeout: 15000 });
    });

    test('should redirect Live Demo section "Launch Live Demo Store" CTA to /agent-mart', async ({
      page,
    }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      const liveDemoSectionBtn = page.getByRole('link', { name: 'Launch Live Demo Store' });
      await expect(liveDemoSectionBtn).toBeVisible({ timeout: 15000 });
      await liveDemoSectionBtn.click();

      await expect(page).toHaveURL(/\/agent-mart/, { timeout: 15000 });
    });

    test('should handle mobile responsive drawer navigation and CTA redirects', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');

      const menuToggleBtn = page.getByTestId('menu-toggle-btn');
      await expect(menuToggleBtn).toBeVisible({ timeout: 15000 });
      await menuToggleBtn.click();

      const drawerLiveDemo = page.getByTestId('drawer-live-demo');
      await expect(drawerLiveDemo).toBeInViewport({ timeout: 10000 });
      await page.waitForTimeout(400);
      await drawerLiveDemo.click({ force: true });

      await expect(page).toHaveURL(/\/agent-mart/, { timeout: 15000 });
    });

    test('should update header CTA to "Dashboard" linking to /admin when authenticated', async ({
      page,
    }) => {
      await setSessionViaInitScript(page);
      await mockSupabaseAuth(page, { user: MOCK_USER });

      await page.goto('/', { waitUntil: 'domcontentloaded' });

      const dashboardBtn = page.getByTestId('desktop-dashboard-btn');
      await expect(dashboardBtn).toBeVisible({ timeout: 15000 });

      await dashboardBtn.click();
      await expect(page).toHaveURL(/\/admin/, { timeout: 15000 });
    });
  });

  test.describe('E2E-8.4: Header & Footer Navigation', () => {
    test('should verify desktop header navigation links ("Features", "Pricing", "About", "Contact") and logo navigation', async ({
      page,
    }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      const headerLogo = page.locator('header').getByAltText('Agentigy Logo');
      await expect(headerLogo).toBeVisible({ timeout: 15000 });

      const featuresLink = page.getByTestId('nav-features-link');
      await expect(featuresLink).toBeVisible({ timeout: 15000 });
      await featuresLink.click();
      await expect(page).toHaveURL(/#features/, { timeout: 15000 });
      await expect(page.locator('#features')).toBeVisible({ timeout: 15000 });

      const pricingLink = page.getByTestId('nav-pricing-link');
      await expect(pricingLink).toBeVisible({ timeout: 15000 });
      await pricingLink.click();
      await expect(page).toHaveURL(/\/pricing/, { timeout: 15000 });
      await expect(page.getByText('Transparent Pricing')).toBeVisible({ timeout: 15000 });

      const aboutLink = page.getByTestId('nav-about-link');
      await expect(aboutLink).toBeVisible({ timeout: 15000 });
      await aboutLink.click();
      await expect(page).toHaveURL(/\/about/, { timeout: 15000 });
      await expect(page.getByText('About Agentify')).toBeVisible({ timeout: 15000 });

      const contactLink = page.getByTestId('nav-contact-link');
      await expect(contactLink).toBeVisible({ timeout: 15000 });
      await contactLink.click();
      await expect(page).toHaveURL(/\/contact/, { timeout: 15000 });
      await expect(page.getByText('Contact Us')).toBeVisible({ timeout: 15000 });

      const returnLogo = page.getByTestId('header-logo-link');
      await returnLogo.click();
      await expect(page).toHaveURL(/localhost:3000\/?$/, { timeout: 15000 });
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15000 });
    });

    test('should toggle mobile navigation drawer and navigate via mobile drawer links', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');

      const menuToggleBtn = page.getByTestId('menu-toggle-btn');
      await expect(menuToggleBtn).toBeVisible({ timeout: 15000 });

      await menuToggleBtn.click();
      await page.waitForTimeout(500);

      await expect(page.getByTestId('drawer-features-link')).toBeInViewport({ timeout: 10000 });
      await expect(page.getByTestId('drawer-pricing-link')).toBeInViewport({ timeout: 10000 });
      await expect(page.getByTestId('drawer-about-link')).toBeInViewport({ timeout: 10000 });
      await expect(page.getByTestId('drawer-contact-link')).toBeInViewport({ timeout: 10000 });
      await expect(page.getByTestId('drawer-live-demo')).toBeInViewport({ timeout: 10000 });

      await expect(page.locator('header').getByRole('link', { name: 'Login' })).toBeVisible({ timeout: 10000 });
      await expect(page.locator('header').getByRole('link', { name: 'Sign Up' })).toBeVisible({ timeout: 10000 });

      const drawerPricing = page.getByTestId('drawer-pricing-link');
      await drawerPricing.click({ force: true });
      await expect(page).toHaveURL(/\/pricing/, { timeout: 15000 });
      await expect(page.getByText('Transparent Pricing')).toBeVisible({ timeout: 15000 });

      const menuBtnPricing = page.getByTestId('menu-toggle-btn');
      await expect(menuBtnPricing).toBeVisible({ timeout: 15000 });
      await menuBtnPricing.click();
      await page.waitForTimeout(500);
      const drawerAbout = page.getByTestId('drawer-about-link');
      await expect(drawerAbout).toBeInViewport({ timeout: 10000 });
      await drawerAbout.click({ force: true });
      await expect(page).toHaveURL(/\/about/, { timeout: 15000 });
      await expect(page.getByText('About Agentify')).toBeVisible({ timeout: 15000 });

      const menuBtnAbout = page.getByTestId('menu-toggle-btn');
      await expect(menuBtnAbout).toBeVisible({ timeout: 15000 });
      await menuBtnAbout.click();
      await page.waitForTimeout(500);
      const drawerContact = page.getByTestId('drawer-contact-link');
      await expect(drawerContact).toBeInViewport({ timeout: 10000 });
      await drawerContact.click({ force: true });
      await expect(page).toHaveURL(/\/contact/, { timeout: 15000 });
      await expect(page.getByText('Contact Us')).toBeVisible({ timeout: 15000 });

      const menuBtnContact = page.getByTestId('menu-toggle-btn');
      await expect(menuBtnContact).toBeVisible({ timeout: 15000 });
      await menuBtnContact.click();
      await page.waitForTimeout(500);
      await menuBtnContact.click();
      await page.waitForTimeout(500);
      const drawerContent = page.getByTestId('drawer-content');
      await expect(drawerContent).not.toBeInViewport();
    });

    test('should verify footer branding, social icons, navigation columns, and legal links', async ({
      page,
    }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      const footerLogo = page.locator('footer').getByAltText('Footer Logo');
      await expect(footerLogo).toBeVisible({ timeout: 15000 });
      await expect(
        page.getByText(/Build and manage intelligent AI agents with ease/i)
      ).toBeVisible({ timeout: 15000 });

      const socialLinks = page.locator('footer a[target="_blank"]');
      await expect(socialLinks).toHaveCount(4);

      const footer = page.locator('footer');
      await expect(footer.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/admin');
      await expect(footer.getByRole('link', { name: 'My Bots' })).toHaveAttribute('href', '/admin/bots');
      await expect(footer.getByRole('link', { name: 'Pricing' })).toHaveAttribute('href', '/pricing');
      await expect(footer.getByRole('link', { name: 'Documentation' })).toHaveAttribute('href', '/work-in-progress');

      await expect(footer.getByRole('link', { name: 'About Us' })).toHaveAttribute('href', '/about');
      await expect(footer.getByRole('link', { name: 'Careers' })).toHaveAttribute('href', '/work-in-progress');
      await expect(footer.getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/work-in-progress');
      await expect(footer.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/contact');

      await expect(footer.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/work-in-progress');
      await expect(footer.getByRole('link', { name: 'Terms of Service' })).toHaveAttribute('href', '/work-in-progress');
      await expect(footer.getByRole('link', { name: 'Security' })).toHaveAttribute('href', '/work-in-progress');

      const currentYear = new Date().getFullYear().toString();
      await expect(
        footer.getByText(new RegExp(`© ${currentYear} Agentigy\\. All rights reserved\\.`, 'i'))
      ).toBeVisible({ timeout: 15000 });

      await footer.getByRole('link', { name: 'About Us' }).click();
      await expect(page).toHaveURL(/\/about/, { timeout: 15000 });
      await expect(page.getByText('About Agentify')).toBeVisible({ timeout: 15000 });

      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.locator('footer').getByRole('link', { name: 'Contact' }).click();
      await expect(page).toHaveURL(/\/contact/, { timeout: 15000 });
      await expect(page.getByText('Contact Us')).toBeVisible({ timeout: 15000 });

      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.locator('footer').getByRole('link', { name: 'Privacy Policy' }).click();
      await expect(page).toHaveURL(/\/work-in-progress/, { timeout: 15000 });
      await expect(page.getByRole('heading', { name: 'Work In Progress' })).toBeVisible({ timeout: 15000 });
    });
  });
});
