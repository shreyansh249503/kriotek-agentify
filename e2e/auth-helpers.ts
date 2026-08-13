import { Page, BrowserContext } from '@playwright/test';

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

const MOCK_JWT_HEADER = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
const MOCK_JWT_PAYLOAD = Buffer.from(
  JSON.stringify({
    sub: MOCK_USER.id,
    aud: 'authenticated',
    role: 'authenticated',
    email: MOCK_USER.email,
    exp: Math.floor(Date.now() / 1000) + 7200,
  })
).toString('base64url');
const MOCK_VALID_JWT = `${MOCK_JWT_HEADER}.${MOCK_JWT_PAYLOAD}.mocksignature123456789`;

export const MOCK_SESSION = {
  access_token: MOCK_VALID_JWT,
  token_type: 'bearer',
  expires_in: 7200,
  expires_at: Math.floor(Date.now() / 1000) + 7200,
  refresh_token: 'mock-valid-refresh-token-playwright',
  user: MOCK_USER,
};

export async function setAuthenticatedSession(page: Page | BrowserContext, customUser?: typeof MOCK_USER) {
  const session = customUser
    ? { ...MOCK_SESSION, user: { ...MOCK_USER, ...customUser } }
    : MOCK_SESSION;

  await page.addInitScript(
    ({ key, sessionData }: { key: string; sessionData: typeof MOCK_SESSION }) => {
      try {
        if (!window.sessionStorage.getItem('__test_logged_out__')) {
          window.localStorage.setItem(key, JSON.stringify(sessionData));
        }
      } catch {
      }
    },
    { key: SUPABASE_STORAGE_KEY, sessionData: session }
  );
}

export async function mockSupabaseAuth(
  page: Page | BrowserContext,
  options?: {
    signupSuccess?: boolean;
    signupErrorMsg?: string;
    loginSuccess?: boolean;
    loginErrorMsg?: string;
    user?: typeof MOCK_USER;
    onUpdateUser?: (updated: unknown) => void;
  }
) {
  let currentUser = { ...MOCK_USER, ...(options?.user || {}) };
  const {
    signupSuccess = true,
    signupErrorMsg = 'Signup failed',
    loginSuccess = true,
    loginErrorMsg = 'Invalid login credentials',
  } = options || {};

  await page.route('**/api/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(currentUser),
    });
  });

  await page.route('**/auth/v1/signup*', async (route) => {
    if (signupSuccess) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: currentUser.id,
          aud: 'authenticated',
          role: 'authenticated',
          email: currentUser.email,
          user_metadata: currentUser.user_metadata,
          created_at: currentUser.created_at,
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

  await page.route('**/auth/v1/token*', async (route) => {
    if (loginSuccess) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...MOCK_SESSION, user: currentUser }),
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
    if (route.request().method() === 'PUT') {
      const putData = route.request().postDataJSON() || {};
      if (putData.data) {
        currentUser = {
          ...currentUser,
          user_metadata: {
            ...currentUser.user_metadata,
            ...putData.data,
          },
        };
      }
      if (options?.onUpdateUser) {
        options.onUpdateUser(putData);
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(currentUser),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(currentUser),
      });
    }
  });

  await page.route('**/auth/v1/logout*', async (route) => {
    await route.fulfill({
      status: 204,
      contentType: 'application/json',
      body: '',
    });
  });
}
