import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCurrentUser } from "./useAuth";
import { getCurrentUser } from "@/services/auth.api";
import React from "react";

jest.mock("@/services/auth.api");

describe("useCurrentUser hook", () => {
  const mockedGetCurrentUser = getCurrentUser as jest.Mock;

  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    return { wrapper: Wrapper };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch current authenticated user data", async () => {
    const mockUser = { id: "u-123", email: "user@example.com" };
    mockedGetCurrentUser.mockResolvedValueOnce(mockUser);

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCurrentUser(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockUser);
  });
});
