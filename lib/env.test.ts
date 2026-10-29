import { assertServerEnv, checkServerEnv } from "./env";

const base = {
  NEXT_PUBLIC_SUPABASE_URL: "https://ref.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
  SUPABASE_SERVICE_ROLE_KEY: "service",
  SUPABASE_DATABASE_URL: "postgresql://u:p@host:6543/postgres",
  GOOGLE_GENERATIVE_AI_API_KEY: "gemini",
};

const production = {
  ...base,
  NODE_ENV: "production",
  ENCRYPTION_KEY: "k".repeat(32),
  SHOPIFY_API_KEY: "key",
  NEXT_PUBLIC_SHOPIFY_API_KEY: "key",
  SHOPIFY_API_SECRET: "secret",
  SHOPIFY_APP_URL: "https://app.example.com",
  SHOPIFY_SCOPES: "read_orders,read_products",
  NEXT_PUBLIC_API_URL: "https://app.example.com",
  NEXT_PUBLIC_WIDGET_URL: "https://app.example.com/widget.js",
  UPSTASH_REDIS_REST_URL: "https://redis.upstash.io",
  UPSTASH_REDIS_REST_TOKEN: "token",
  SMTP_HOST: "smtp.resend.com",
  SMTP_USER: "resend",
  SMTP_PASS: "pass",
  EMAIL_FROM: "Agentify <no-reply@example.com>",
  SUPABASE_DB_CA_CERT: "-----BEGIN CERTIFICATE-----",
  LANGFUSE_PUBLIC_KEY: "pk",
  LANGFUSE_SECRET_KEY: "sk",
  DEFAULT_MONTHLY_TOKEN_BUDGET: "2000000",
  CRON_SECRET: "cron_secret",
};

const env = (vars: Record<string, string | undefined>) => vars as unknown as NodeJS.ProcessEnv;
const without = (vars: Record<string, string>, ...keys: string[]) =>
  Object.fromEntries(Object.entries(vars).filter(([k]) => !keys.includes(k)));

describe("checkServerEnv", () => {
  it("accepts a complete production config with no warnings", () => {
    expect(checkServerEnv(env(production))).toEqual({ errors: [], warnings: [] });
  });

  it("only requires the core variables in development", () => {
    expect(checkServerEnv(env({ ...base, NODE_ENV: "development" }))).toEqual({ errors: [], warnings: [] });
  });

  it("reports every missing core variable", () => {
    const { errors } = checkServerEnv(env({ NODE_ENV: "development" }));
    expect(errors).toHaveLength(5);
    expect(errors.join("\n")).toContain("SUPABASE_DATABASE_URL");
  });

  it.each([
    ["ENCRYPTION_KEY", { ENCRYPTION_KEY: "short" }],
    ["SHOPIFY_API_SECRET", { SHOPIFY_API_SECRET: "" }],
    ["UPSTASH_REDIS_REST_URL", { UPSTASH_REDIS_REST_TOKEN: "" }],
    ["SMTP_HOST", { SMTP_HOST: "", GMAIL_USER: "" }],
    ["NEXT_PUBLIC_WIDGET_URL", { NEXT_PUBLIC_WIDGET_URL: "" }],
  ])("requires %s in production", (name, override) => {
    const { errors } = checkServerEnv(env({ ...production, ...override }));
    expect(errors.join("\n")).toContain(name);
  });

  it("accepts Vercel KV variables instead of Upstash", () => {
    const vars = { ...without(production, "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"), KV_REST_API_URL: "u", KV_REST_API_TOKEN: "t" };
    expect(checkServerEnv(env(vars)).errors).toEqual([]);
  });

  it("allows the Gmail fallback in production with a warning", () => {
    const vars = { ...without(production, "SMTP_HOST", "SMTP_USER", "SMTP_PASS"), GMAIL_USER: "g", GMAIL_APP_PASSWORD: "p" };
    const report = checkServerEnv(env(vars));
    expect(report.errors).toEqual([]);
    expect(report.warnings.join("\n")).toContain("Gmail");
  });

  it("rejects invalid and non-https URLs in production", () => {
    const { errors } = checkServerEnv(env({ ...production, SHOPIFY_APP_URL: "http://app.example.com", NEXT_PUBLIC_API_URL: "not a url" }));
    expect(errors).toEqual(
      expect.arrayContaining([
        "SHOPIFY_APP_URL must use https in production",
        "NEXT_PUBLIC_API_URL is not a valid URL",
      ])
    );
  });

  it("warns about optional production hardening", () => {
    const { warnings } = checkServerEnv(env(without(production, "SUPABASE_DB_CA_CERT", "LANGFUSE_SECRET_KEY", "DEFAULT_MONTHLY_TOKEN_BUDGET")));
    expect(warnings.join("\n")).toContain("DEFAULT_MONTHLY_TOKEN_BUDGET");
    expect(warnings.join("\n")).toContain("SUPABASE_DB_CA_CERT");
    expect(warnings.join("\n")).toContain("LANGFUSE");
  });
});

describe("assertServerEnv", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  it("throws in production, listing names but never values", () => {
    const vars = { ...production, ENCRYPTION_KEY: "secret-but-too-short", SHOPIFY_API_SECRET: "" };
    expect(() => assertServerEnv(env(vars))).toThrow(/ENCRYPTION_KEY[\s\S]*SHOPIFY_API_SECRET/);
    try {
      assertServerEnv(env(vars));
    } catch (e) {
      expect((e as Error).message).not.toContain("secret-but-too-short");
    }
  });

  it("only logs in development", () => {
    expect(() => assertServerEnv(env({ NODE_ENV: "development" }))).not.toThrow();
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Invalid server environment"));
  });
});
