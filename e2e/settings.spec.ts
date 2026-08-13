import { test, expect } from '@playwright/test';
import {
  MOCK_USER,
  setAuthenticatedSession,
  mockSupabaseAuth,
} from './auth-helpers';

test.describe('Admin Profile & Settings Flow', () => {
  const SETTINGS_USER = {
    ...MOCK_USER,
    id: 'usr-999-aaa-bbb',
    email: 'sarah.connor@cyberdyne.org',
    role: 'admin',
    user_metadata: {
      name: 'Sarah Connor',
      full_name: 'Sarah Connor',
      phone: '+1 (555) 019-2834',
      company: 'Resistance Technologies',
      role: 'admin',
    },
  };

  test.beforeEach(async ({ page }) => {
    await setAuthenticatedSession(page, SETTINGS_USER);
  });

  test.describe('E2E-6.1: Profile Information Display & Update', () => {
    test('should pre-populate profile card and form with current authenticated user metadata', async ({
      page,
    }) => {
      await mockSupabaseAuth(page, {
        user: SETTINGS_USER,
      });

      await page.goto('/admin/settings', { waitUntil: 'domcontentloaded' });

      const nameInput = page.locator('input[name="name"]');
      const emailInput = page.locator('input[name="email"]');
      const phoneInput = page.locator('input[name="phone"]');
      const companyInput = page.locator('input[name="company"]');

      await expect(nameInput).toBeVisible({ timeout: 20000 });
      await expect(nameInput).toHaveValue('Sarah Connor');

      await expect(emailInput).toBeVisible();
      await expect(emailInput).toHaveValue('sarah.connor@cyberdyne.org');
      await expect(emailInput).toBeDisabled();

      await expect(phoneInput).toBeVisible();
      await expect(phoneInput).toHaveValue('+1 (555) 019-2834');

      await expect(companyInput).toBeVisible();
      await expect(companyInput).toHaveValue('Resistance Technologies');

      await expect(page.getByRole('heading', { name: 'Sarah Connor', level: 1 })).toBeVisible({ timeout: 15000 });

      await expect(page.getByText('sarah.connor@cyberdyne.org').first()).toBeVisible();

      await expect(page.getByText('admin').first()).toBeVisible();

      const initials = page.locator('span').filter({ hasText: 'SC' }).last();
      await expect(initials).toBeVisible();
    });

    test('should update profile metadata (name, phone, company) and assert success notification banner', async ({
      page,
    }) => {
      let updatedPayload: unknown = null;
      await mockSupabaseAuth(page, {
        user: SETTINGS_USER,
        onUpdateUser: (data) => {
          updatedPayload = data;
        },
      });

      await page.goto('/admin/settings', { waitUntil: 'domcontentloaded' });

      const nameInput = page.locator('input[name="name"]');
      const phoneInput = page.locator('input[name="phone"]');
      const companyInput = page.locator('input[name="company"]');
      const saveBtn = page.getByRole('button', { name: /Save Changes/i });

      await expect(nameInput).toBeVisible({ timeout: 20000 });

      await nameInput.fill('Sarah Jane Connor');
      await phoneInput.fill('+1 (555) 999-7777');
      await companyInput.fill('Apex Defense Systems');

      await saveBtn.click();

      const successBanner = page.getByText('Profile updated successfully!');
      await expect(successBanner).toBeVisible({ timeout: 10000 });

      await expect(page.getByRole('heading', { name: 'Sarah Jane Connor', level: 1 })).toBeVisible();
      await expect(page.locator('span').filter({ hasText: 'SJ' }).last()).toBeVisible();
      expect(updatedPayload).not.toBeNull();
    });
  });

  test.describe('E2E-6.2: Password Change & Security Validations', () => {
    test('should display error banner when new password and confirm password do not match', async ({
      page,
    }) => {
      await mockSupabaseAuth(page, {
        user: SETTINGS_USER,
      });

      await page.goto('/admin/settings', { waitUntil: 'domcontentloaded' });

      const passwordInput = page.locator('input[name="password"]');
      const confirmPasswordInput = page.locator('input[name="confirmPassword"]');
      const saveBtn = page.getByRole('button', { name: /Save Changes/i });

      await expect(passwordInput).toBeVisible({ timeout: 20000 });

      await passwordInput.fill('ValidPassword123!');
      await confirmPasswordInput.fill('DifferentPassword999!');
      await saveBtn.click();

      const errorBanner = page.getByText('Passwords do not match');
      await expect(errorBanner).toBeVisible({ timeout: 10000 });
    });

    test('should display error banner when password is shorter than 6 characters', async ({
      page,
    }) => {
      await mockSupabaseAuth(page, {
        user: SETTINGS_USER,
      });

      await page.goto('/admin/settings', { waitUntil: 'domcontentloaded' });

      const passwordInput = page.locator('input[name="password"]');
      const confirmPasswordInput = page.locator('input[name="confirmPassword"]');
      const saveBtn = page.getByRole('button', { name: /Save Changes/i });

      await expect(passwordInput).toBeVisible({ timeout: 20000 });

      await passwordInput.fill('12345');
      await confirmPasswordInput.fill('12345');
      await saveBtn.click();

      const errorBanner = page.getByText('Password must be at least 6 characters');
      await expect(errorBanner).toBeVisible({ timeout: 10000 });
    });

    test('should successfully update password, submit to Supabase auth, and reset password input fields', async ({
      page,
    }) => {
      let updatedPayload: { password?: string } | null = null;
      await mockSupabaseAuth(page, {
        user: SETTINGS_USER,
        onUpdateUser: (data) => {
          updatedPayload = data as { password?: string };
        },
      });

      await page.goto('/admin/settings', { waitUntil: 'domcontentloaded' });

      const passwordInput = page.locator('input[name="password"]');
      const confirmPasswordInput = page.locator('input[name="confirmPassword"]');
      const saveBtn = page.getByRole('button', { name: /Save Changes/i });

      await expect(passwordInput).toBeVisible({ timeout: 20000 });

      await passwordInput.fill('NewSecurePassword123!');
      await confirmPasswordInput.fill('NewSecurePassword123!');

      await saveBtn.click();

      await expect(page.getByText('Profile updated successfully!')).toBeVisible({ timeout: 10000 });

      await expect(passwordInput).toHaveValue('');
      await expect(confirmPasswordInput).toHaveValue('');

      const payload = updatedPayload as { password?: string } | null;
      expect(payload).not.toBeNull();
      expect(payload?.password).toBe('NewSecurePassword123!');
    });
  });

  test.describe('E2E-6.3: Profile Avatar & Media Actions', () => {
    test('should render avatar edit trigger with accessibility title', async ({
      page,
    }) => {
      await mockSupabaseAuth(page, {
        user: SETTINGS_USER,
      });

      await page.goto('/admin/settings', { waitUntil: 'domcontentloaded' });

      const avatarEditBtn = page.locator('button[title="Change avatar"]');
      await expect(avatarEditBtn).toBeVisible({ timeout: 20000 });
      await expect(avatarEditBtn).toBeEnabled();
    });
  });
});
