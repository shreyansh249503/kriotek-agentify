import { test, expect } from '@playwright/test';
import {
  mockSupabaseAuth,
  setAuthenticatedSession,
  SUPABASE_STORAGE_KEY,
} from './auth-helpers';

test.describe('Authentication & Authorization Flow', () => {
  test.describe('E2E-1.1: User Registration (/signup)', () => {
    test('should fill registration details, assert success message, and automatically redirect to /login', async ({
      page,
    }) => {
      await mockSupabaseAuth(page, { signupSuccess: true });

      await page.goto('/signup', { waitUntil: 'domcontentloaded' });

      await expect(
        page.getByRole('heading', { name: 'Create Account' })
      ).toBeVisible();

      const nameInput = page.locator('#name');
      const emailInput = page.locator('#email');
      const passwordInput = page.locator('#password');
      const submitButton = page.getByRole('button', { name: 'Sign Up' });

      await expect(nameInput).toBeVisible();
      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();

      await nameInput.fill('John Doe');
      await emailInput.fill('johndoe@example.com');
      await passwordInput.fill('SecurePassword123!');

      await submitButton.click();

      const successMessage = page.getByText(
        'Account created! Redirecting to login...'
      );
      await expect(successMessage).toBeVisible();

      await expect(nameInput).toBeDisabled();
      await expect(emailInput).toBeDisabled();
      await expect(passwordInput).toBeDisabled();

      await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
      await expect(
        page.getByRole('heading', { name: 'Welcome Back' })
      ).toBeVisible({ timeout: 10000 });
    });

    test('should show error banner when registration fails', async ({
      page,
    }) => {
      const errorMessage = 'User already registered';
      await mockSupabaseAuth(page, {
        signupSuccess: false,
        signupErrorMsg: errorMessage,
      });

      await page.goto('/signup', { waitUntil: 'domcontentloaded' });

      await page.locator('#name').fill('Jane Doe');
      await page.locator('#email').fill('existinguser@example.com');
      await page.locator('#password').fill('Password123!');
      await page.getByRole('button', { name: 'Sign Up' }).click();

      await expect(page.getByText(errorMessage)).toBeVisible();

      await expect(page).toHaveURL(/\/signup/);
    });
  });

  test.describe('E2E-1.2: User Authentication (/login)', () => {
    test('should sign in with valid credentials and redirect to /admin dashboard', async ({
      page,
    }) => {
      await mockSupabaseAuth(page, { loginSuccess: true });

      await page.goto('/login', { waitUntil: 'domcontentloaded' });

      await expect(
        page.getByRole('heading', { name: 'Welcome Back' })
      ).toBeVisible();

      const emailInput = page.locator('#email');
      const passwordInput = page.locator('#password');
      const submitButton = page.getByRole('button', { name: 'Sign In' });

      await emailInput.fill('validuser@example.com');
      await passwordInput.fill('ValidPassword123!');
      await submitButton.click();

      await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });
    });

    test('should display error banner on invalid login attempt', async ({
      page,
    }) => {
      const errorMessage = 'Invalid login credentials';
      await mockSupabaseAuth(page, {
        loginSuccess: false,
        loginErrorMsg: errorMessage,
      });

      await page.goto('/login', { waitUntil: 'domcontentloaded' });

      const emailInput = page.locator('#email');
      const passwordInput = page.locator('#password');
      const submitButton = page.getByRole('button', { name: 'Sign In' });

      await emailInput.fill('invalid@example.com');
      await passwordInput.fill('WrongPassword123!');
      await submitButton.click();

      const errorBanner = page.getByText(errorMessage);
      await expect(errorBanner).toBeVisible();

      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('E2E-1.3: Auth Guard Protection (RefreshAuthGuard & AuthGuard)', () => {
    test('should redirect unauthenticated access on /admin and subroutes to /login', async ({
      page,
    }) => {
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.evaluate((key) => window.localStorage.removeItem(key), SUPABASE_STORAGE_KEY);

      await page.goto('/admin', { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

      await page.goto('/admin/new', { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

      await page.goto('/admin/bots', { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

      await page.goto('/admin/leads', { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    test('should redirect authenticated access on /login and /signup to /admin', async ({
      page,
    }) => {
      await setAuthenticatedSession(page);
      await mockSupabaseAuth(page);

      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });

      await page.goto('/signup', { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });
    });
  });

  test.describe('E2E-1.4: Session Logout & Persistence', () => {
    test('should verify session remains active upon browser refresh', async ({
      page,
    }) => {
      await setAuthenticatedSession(page);
      await mockSupabaseAuth(page);

      await page.goto('/admin', { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/admin/);

      await page.reload({ waitUntil: 'domcontentloaded' });

      await expect(page).toHaveURL(/\/admin/);

      const storedSession = await page.evaluate((key) => {
        return window.localStorage.getItem(key);
      }, SUPABASE_STORAGE_KEY);

      expect(storedSession).not.toBeNull();
      expect(JSON.parse(storedSession!)).toHaveProperty('access_token');
    });

    test('should perform logout and verify session token clearance and redirect to /login', async ({
      page,
    }) => {
      await setAuthenticatedSession(page);
      await mockSupabaseAuth(page);
      await page.goto('/admin', { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/admin/);

      const sidebar = page.locator('aside').first();
      await expect(sidebar).toBeVisible({ timeout: 10000 });

      const profileTrigger = sidebar.getByText(/Test Admin|Rishabh Verma|rishabh2552002/i).first();
      await profileTrigger.click();

      const logoutItem = page.getByText('Log out').first();
      await expect(logoutItem).toBeVisible({ timeout: 5000 });
      await page.evaluate(() => {
        try {
          window.sessionStorage.setItem('__test_logged_out__', 'true');
          document.cookie = '__test_logged_out__=true; path=/';
        } catch {}
      });
      await logoutItem.click();

      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

      const sessionAfterLogout = await page.evaluate((key) => {
        return window.localStorage.getItem(key);
      }, SUPABASE_STORAGE_KEY);

      expect(sessionAfterLogout).toBeNull();

      await page.goto('/admin', { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });
  });
});
