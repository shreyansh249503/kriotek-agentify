import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLeads } from "./useLead";
import { getAllLeads } from "@/services/lead.api";
import React from "react";

jest.mock("@/services/lead.api");

describe("useLeads hook", () => {
  const mockedGetAllLeads = getAllLeads as jest.Mock;

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

  it("should fetch all leads successfully", async () => {
    const mockLeads = [{ id: "l-1", name: "Jane" }];
    mockedGetAllLeads.mockResolvedValueOnce(mockLeads);

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useLeads(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedGetAllLeads).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockLeads);
  });
});
