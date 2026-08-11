import { Page } from '@playwright/test';

export const SUPABASE_STORAGE_KEY = 'sb-bhyrxyzokssibgeznojo-auth-token';

export const MOCK_USER = {
  id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'testuser@example.com',
  email_confirmed_at: '2026-01-01T00:00:00.000Z',
  phone: '',
  user_metadata: {
    name: 'Test Admin',
    full_name: 'Test Admin',
  },
  app_metadata: {
    provider: 'email',
    providers: ['email'],
  },
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

export const MOCK_SESSION = {
  access_token: 'mock-valid-access-token-playwright',
  token_type: 'bearer',
  expires_in: 7200,
  expires_at: Math.floor(Date.now() / 1000) + 7200,
  refresh_token: 'mock-valid-refresh-token-playwright',
  user: MOCK_USER,
};

/**
 * Sets an authenticated session in localStorage before page load.
 */
export async function setAuthenticatedSession(page: Page) {
  await page.addInitScript(
    ({ key, session }) => {
      try {
        if (!window.sessionStorage.getItem('__test_logged_out__')) {
          window.localStorage.setItem(key, JSON.stringify(session));
        }
      } catch (e) {}
    },
    { key: SUPABASE_STORAGE_KEY, session: MOCK_SESSION }
  );
}

/**
 * Helper to intercept common Supabase Auth endpoints for reliable test execution.
 */
export async function mockSupabaseAuth(
  page: Page,
  options?: {
    signupSuccess?: boolean;
    signupErrorMsg?: string;
    loginSuccess?: boolean;
    loginErrorMsg?: string;
  }
) {
  const {
    signupSuccess = true,
    signupErrorMsg = 'Signup failed',
    loginSuccess = true,
    loginErrorMsg = 'Invalid login credentials',
  } = options || {};

  await page.route('**/auth/v1/signup*', async (route) => {
    if (signupSuccess) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: MOCK_USER.id,
          aud: 'authenticated',
          role: 'authenticated',
          email: MOCK_USER.email,
          user_metadata: MOCK_USER.user_metadata,
          created_at: MOCK_USER.created_at,
          session: null,
        }),
      });
    } else {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'signup_error',
          error_description: signupErrorMsg,
          message: signupErrorMsg,
          msg: signupErrorMsg,
        }),
      });
    }
  });

  await page.route('**/auth/v1/token?grant_type=password*', async (route) => {
    if (loginSuccess) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_SESSION),
      });
    } else {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'invalid_grant',
          error_description: loginErrorMsg,
          message: loginErrorMsg,
          msg: loginErrorMsg,
        }),
      });
    }
  });

  await page.route('**/auth/v1/user*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_USER),
    });
  });

  await page.route('**/auth/v1/logout*', async (route) => {
    await route.fulfill({
      status: 204,
      contentType: 'application/json',
      body: '',
    });
  });
}
