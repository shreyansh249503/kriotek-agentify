/**
 * Shared Jest mock for the service-role client. In a test:
 *
 *   jest.mock("@/app/api/lib/supabase-admin");
 *   (supabaseAdmin.from as jest.Mock).mockImplementation((table) => ...);
 *
 * Every method is a bare jest.fn(); set the ones a test needs.
 */
export const supabaseAdmin = {
  from: jest.fn(),
  storage: { from: jest.fn() },
  auth: {
    getUser: jest.fn(),
    admin: { getUserById: jest.fn() },
  },
};

export const getSupabaseAdmin = jest.fn(() => supabaseAdmin);
