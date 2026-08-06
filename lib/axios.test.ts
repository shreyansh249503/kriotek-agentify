import { supabase } from "@/lib/supabase";
import axiosInstance from "./axios";

jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
  },
}));

describe("axiosInstance interceptors", () => {
  const mockGetSession = supabase.auth.getSession as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should attach Authorization header when active supabase session exists", async () => {
    mockGetSession.mockResolvedValueOnce({
      data: {
        session: {
          access_token: "mock-jwt-token-123",
        },
      },
    });

    const requestInterceptor = (axiosInstance.interceptors.request as unknown as {
      handlers: Array<{ fulfilled: (config: Record<string, unknown>) => Promise<Record<string, unknown>> }>;
    }).handlers[0].fulfilled;

    const dummyConfig = { headers: {} };
    const resultConfig = await requestInterceptor(dummyConfig);

    expect(resultConfig.headers).toEqual({
      Authorization: "Bearer mock-jwt-token-123",
    });
  });

  it("should not attach Authorization header when no session exists", async () => {
    mockGetSession.mockResolvedValueOnce({
      data: {
        session: null,
      },
    });

    const requestInterceptor = (axiosInstance.interceptors.request as unknown as {
      handlers: Array<{ fulfilled: (config: Record<string, unknown>) => Promise<Record<string, unknown>> }>;
    }).handlers[0].fulfilled;

    const dummyConfig = { headers: {} };
    const resultConfig = await requestInterceptor(dummyConfig);

    expect((resultConfig.headers as Record<string, string>).Authorization).toBeUndefined();
  });
});
