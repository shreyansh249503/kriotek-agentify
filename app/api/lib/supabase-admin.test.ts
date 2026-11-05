import { createClient } from "@supabase/supabase-js";

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(function (this: unknown, table: string) {
      return { table, self: this };
    }),
    auth: { getUser: jest.fn() },
  })),
}));

type AdminModule = typeof import("./supabase-admin");

describe("supabase-admin", () => {
  const env = { ...process.env };

  // A fresh copy of the module each time, so the cached client doesn't leak between tests.
  const load = (): AdminModule => {
    let mod!: AdminModule;
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      mod = require("./supabase-admin");
    });
    return mod;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service_role_key";
  });

  afterAll(() => {
    process.env = env;
  });

  it("can be imported without env vars, so builds don't fail", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(() => load()).not.toThrow();
    expect(createClient).not.toHaveBeenCalled();
  });

  it("says which env var is missing when first used", () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const { supabaseAdmin } = load();

    expect(() => supabaseAdmin.from("bots")).toThrow("Missing env.SUPABASE_SERVICE_ROLE_KEY");
  });

  it("creates one client on first use and reuses it", () => {
    const { supabaseAdmin, getSupabaseAdmin } = load();

    supabaseAdmin.from("bots");
    supabaseAdmin.from("leads");

    expect(createClient).toHaveBeenCalledTimes(1);
    expect(createClient).toHaveBeenCalledWith("https://project.supabase.co", "service_role_key", {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    expect(getSupabaseAdmin()).toBe((createClient as jest.Mock).mock.results[0].value);
  });

  it("calls client methods on the real client", () => {
    const { supabaseAdmin, getSupabaseAdmin } = load();

    const result = supabaseAdmin.from("bots") as unknown as { table: string; self: unknown };

    expect(result.table).toBe("bots");
    expect(result.self).toBe(getSupabaseAdmin());
    expect(supabaseAdmin.auth).toBe(getSupabaseAdmin().auth);
  });
});
