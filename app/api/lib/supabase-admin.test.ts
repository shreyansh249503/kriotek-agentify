import { supabaseAdmin } from "./supabase-admin";

describe("supabaseAdmin", () => {
  it("should export initialized Supabase admin client instance", () => {
    expect(supabaseAdmin).toBeDefined();
    expect(supabaseAdmin.auth).toBeDefined();
    expect(supabaseAdmin.from).toBeDefined();
  });
});
