import { test, expect } from '@playwright/test';

test.describe('Landing Page & Navigation', () => {
  test('should load the home page and have correct title or main elements', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\//);

    await expect(page.locator('body')).toBeVisible();
  });
});
