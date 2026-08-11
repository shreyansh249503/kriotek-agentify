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
      // Mock successful signup response
      await mockSupabaseAuth(page, { signupSuccess: true });

      await page.goto('/signup', { waitUntil: 'domcontentloaded' });

      // Assert header and form elements are visible
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

      // Fill full name, email, and password
      await nameInput.fill('John Doe');
      await emailInput.fill('johndoe@example.com');
      await passwordInput.fill('SecurePassword123!');

      // Submit registration
      await submitButton.click();

      // Assert success message
      const successMessage = page.getByText(
        'Account created! Redirecting to login...'
      );
      await expect(successMessage).toBeVisible();

      // Inputs should be disabled during success countdown
      await expect(nameInput).toBeDisabled();
      await expect(emailInput).toBeDisabled();
      await expect(passwordInput).toBeDisabled();

      // Verify automatic redirect to /login (accounted for 2000ms delay + Next.js route transition)
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

      // Assert error message banner is displayed
      await expect(page.getByText(errorMessage)).toBeVisible();

      // Ensure user remains on /signup page
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

      // Enter valid credentials
      await emailInput.fill('validuser@example.com');
      await passwordInput.fill('ValidPassword123!');
      await submitButton.click();

      // Verify redirection to /admin dashboard
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

      // Enter invalid credentials
      await emailInput.fill('invalid@example.com');
      await passwordInput.fill('WrongPassword123!');
      await submitButton.click();

      // Assert error banner display
      const errorBanner = page.getByText(errorMessage);
      await expect(errorBanner).toBeVisible();

      // Verify user remains on /login
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('E2E-1.3: Auth Guard Protection (RefreshAuthGuard & AuthGuard)', () => {
    test('should redirect unauthenticated access on /admin and subroutes to /login', async ({
      page,
    }) => {
      // Ensure clean storage without any auth token
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.evaluate((key) => window.localStorage.removeItem(key), SUPABASE_STORAGE_KEY);

      // Attempt to access /admin directly
      await page.goto('/admin', { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

      // Attempt to access /admin/new directly
      await page.goto('/admin/new', { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

      // Attempt to access /admin/bots directly
      await page.goto('/admin/bots', { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

      // Attempt to access /admin/leads directly
      await page.goto('/admin/leads', { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    test('should redirect authenticated access on /login and /signup to /admin', async ({
      page,
    }) => {
      // Seed authenticated session
      await setAuthenticatedSession(page);
      await mockSupabaseAuth(page);

      // Attempt visiting /login while already logged in
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });

      // Attempt visiting /signup while already logged in
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

      // Navigate to protected /admin page
      await page.goto('/admin', { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/admin/);

      // Refresh the browser page
      await page.reload({ waitUntil: 'domcontentloaded' });

      // Verify session persists and user stays on /admin
      await expect(page).toHaveURL(/\/admin/);

      // Verify session token is still present in localStorage
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

      // Locate desktop sidebar
      const sidebar = page.locator('aside').first();
      await expect(sidebar).toBeVisible({ timeout: 10000 });

      // Click user profile trigger in the sidebar to open popover
      const profileTrigger = sidebar.getByText(/Test Admin|Rishabh Verma|rishabh2552002/i).first();
      await profileTrigger.click();

      // Locate and click "Log out" menu item in the popover
      const logoutItem = page.getByText('Log out').first();
      await expect(logoutItem).toBeVisible({ timeout: 5000 });
      await page.evaluate(() => {
        try {
          window.sessionStorage.setItem('__test_logged_out__', 'true');
        } catch (e) {}
      });
      await logoutItem.click();

      // Verify redirect to /login
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

      // Verify session token is removed from localStorage
      const sessionAfterLogout = await page.evaluate((key) => {
        return window.localStorage.getItem(key);
      }, SUPABASE_STORAGE_KEY);

      expect(sessionAfterLogout).toBeNull();

      // Verify trying to visit /admin again redirects back to /login
      await page.goto('/admin', { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });
  });
});
