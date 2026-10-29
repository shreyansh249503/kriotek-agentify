/**
 * Server environment checks, run once at startup from instrumentation.ts.
 * Production refuses to start with missing or invalid config instead of failing on the first
 * request that needs it. Values are never logged, only variable names.
 */

export interface EnvReport {
  errors: string[];
  warnings: string[];
}

const MIN_ENCRYPTION_KEY_LENGTH = 32;

export function checkServerEnv(env: NodeJS.ProcessEnv = process.env): EnvReport {
  const isProduction = env.NODE_ENV === "production";
  const errors: string[] = [];
  const warnings: string[] = [];

  const has = (key: string) => Boolean(env[key]?.trim());
  const requireAll = (keys: string[], purpose: string, target: string[] = errors) => {
    for (const key of keys) {
      if (!has(key)) target.push(`${key} is required (${purpose})`);
    }
  };
  const requireUrl = (key: string) => {
    const value = env[key]?.trim();
    if (!value) return;
    try {
      const { protocol } = new URL(value);
      if (protocol !== "https:" && protocol !== "http:") throw new Error();
      if (isProduction && protocol !== "https:") errors.push(`${key} must use https in production`);
    } catch {
      errors.push(`${key} is not a valid URL`);
    }
  };

  // Needed in every environment: the app does nothing useful without them.
  requireAll(["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"], "Supabase");
  requireAll(["SUPABASE_DATABASE_URL"], "Postgres connection");
  requireAll(["GOOGLE_GENERATIVE_AI_API_KEY"], "Gemini");
  requireUrl("NEXT_PUBLIC_SUPABASE_URL");

  if (!isProduction) {
    return { errors, warnings };
  }

  // Production only.
  if ((env.ENCRYPTION_KEY?.length ?? 0) < MIN_ENCRYPTION_KEY_LENGTH) {
    errors.push(`ENCRYPTION_KEY is required with at least ${MIN_ENCRYPTION_KEY_LENGTH} characters (Shopify token encryption)`);
  }

  requireAll(["SHOPIFY_API_KEY", "NEXT_PUBLIC_SHOPIFY_API_KEY", "SHOPIFY_API_SECRET", "SHOPIFY_APP_URL", "SHOPIFY_SCOPES"], "Shopify app");
  requireUrl("SHOPIFY_APP_URL");

  requireAll(["NEXT_PUBLIC_API_URL", "NEXT_PUBLIC_WIDGET_URL"], "widget embed URLs");
  requireUrl("NEXT_PUBLIC_API_URL");
  requireUrl("NEXT_PUBLIC_WIDGET_URL");

  const hasUpstash = has("UPSTASH_REDIS_REST_URL") && has("UPSTASH_REDIS_REST_TOKEN");
  const hasVercelKv = has("KV_REST_API_URL") && has("KV_REST_API_TOKEN");
  if (!hasUpstash && !hasVercelKv) {
    errors.push(
      "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required (in-memory rate limits are per serverless instance and don't protect production)",
    );
  }

  const hasSmtp = has("SMTP_HOST") && has("SMTP_USER") && has("SMTP_PASS") && has("EMAIL_FROM");
  const hasGmail = has("GMAIL_USER") && has("GMAIL_APP_PASSWORD");
  if (!hasSmtp && !hasGmail) {
    errors.push("SMTP_HOST, SMTP_USER, SMTP_PASS and EMAIL_FROM are required (lead and privacy-request emails)");
  } else if (!hasSmtp) {
    warnings.push("Email is using the legacy Gmail fallback; set SMTP_HOST, SMTP_USER, SMTP_PASS and EMAIL_FROM");
  }

  if (!has("DEFAULT_MONTHLY_TOKEN_BUDGET")) {
    warnings.push("DEFAULT_MONTHLY_TOKEN_BUDGET is not set; bots without their own budget have unlimited Gemini spend");
  }
  if (!has("SUPABASE_DB_CA_CERT")) {
    warnings.push("SUPABASE_DB_CA_CERT is not set; the database TLS certificate is not verified");
  }
  if (!has("LANGFUSE_PUBLIC_KEY") || !has("LANGFUSE_SECRET_KEY")) {
    warnings.push("LANGFUSE_PUBLIC_KEY / LANGFUSE_SECRET_KEY are not set; LLM tracing is disabled");
  }
  if (!has("CRON_SECRET")) {
    warnings.push("CRON_SECRET is not set; Vercel cron endpoints (/api/cron/*) will reject invocations");
  }

  return { errors, warnings };
}

/** Logs warnings; throws in production (logs in development) when required config is missing. */
export function assertServerEnv(env: NodeJS.ProcessEnv = process.env): void {
  const { errors, warnings } = checkServerEnv(env);

  for (const warning of warnings) {
    console.warn(`[env] ${warning}`);
  }

  if (errors.length === 0) return;

  const message = `Invalid server environment:\n  - ${errors.join("\n  - ")}`;
  if (env.NODE_ENV === "production") {
    throw new Error(message);
  }
  console.error(`[env] ${message}`);
}
