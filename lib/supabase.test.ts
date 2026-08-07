import { supabase } from "./supabase";
import { createClient } from "@supabase/supabase-js";

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    auth: {},
    from: jest.fn(),
  })),
}));

describe("supabase browser client", () => {
  it("initializes supabase client with environment variables", () => {
    expect(createClient).toHaveBeenCalled();
    expect(supabase).toBeDefined();
  });
});
