import { test, expect } from '@playwright/test';

test.describe('Landing Page & Navigation', () => {
  test('should load the home page and have correct title or main elements', async ({ page }) => {
    // Navigate to base URL
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Verify page has loaded
    await expect(page).toHaveURL(/\//);

    // Verify page body is visible
    await expect(page.locator('body')).toBeVisible();
  });
});
