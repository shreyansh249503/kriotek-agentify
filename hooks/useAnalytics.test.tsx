import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAnalytics } from "./useAnalytics";
import { getAnalytics } from "@/services/analytics.api";
import React from "react";

jest.mock("@/services/analytics.api");

describe("useAnalytics hook", () => {
  const mockedGetAnalytics = getAnalytics as jest.Mock;

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

  it("should fetch analytics data successfully", async () => {
    const mockData = { totals: { total_conversations: 10 } };
    mockedGetAnalytics.mockResolvedValueOnce(mockData);

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useAnalytics(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedGetAnalytics).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockData);
  });
});
