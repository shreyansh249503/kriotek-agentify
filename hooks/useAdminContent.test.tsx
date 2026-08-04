import { renderHook } from "@testing-library/react";
import useAdminContent from "./useAdminContent";
import { useBots } from "@/hooks/useBot";
import { useAnalytics } from "@/hooks/useAnalytics";

jest.mock("@/hooks/useBot");
jest.mock("@/hooks/useAnalytics");

describe("useAdminContent hook", () => {
  const mockedUseBots = useBots as jest.Mock;
  const mockedUseAnalytics = useAnalytics as jest.Mock;

  const mockBots = [
    { id: "bot-1", name: "Old Bot", created_at: "2025-01-01T00:00:00Z" },
    { id: "bot-2", name: "New Bot With A Very Long Name Indeed", created_at: "2025-06-01T00:00:00Z" },
    { id: "bot-3", name: "Medium Bot", created_at: "2025-03-01T00:00:00Z" },
    { id: "bot-4", name: "Bot 4", created_at: "2025-04-01T00:00:00Z" },
    { id: "bot-5", name: "Bot 5", created_at: "2025-05-01T00:00:00Z" },
  ];

  const mockAnalytics = {
    totals: {
      total_conversations: 20,
      total_leads: 5,
    },
    convosPerBot: [
      { bot_id: "bot-1", bot_name: "Old Bot", total_conversations: "10" },
      { bot_id: "bot-2", bot_name: "New Bot With A Very Long Name Indeed", total_conversations: "10" },
    ],
    leadsPerBot: [
      { bot_id: "bot-1", bot_name: "Old Bot", total_leads: "2" },
      { bot_id: "bot-2", bot_name: "New Bot With A Very Long Name Indeed", total_leads: "3" },
      { bot_id: "bot-3", bot_name: "Zero Leads Bot", total_leads: "0" },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return isLoading true when bots or analytics are loading", () => {
    mockedUseBots.mockReturnValue({ data: [], isLoading: true });
    mockedUseAnalytics.mockReturnValue({ data: undefined, isLoading: false });

    const { result } = renderHook(() => useAdminContent());
    expect(result.current.isLoading).toBe(true);
  });

  it("should process and return admin content correctly when data is available", () => {
    mockedUseBots.mockReturnValue({ data: mockBots, isLoading: false });
    mockedUseAnalytics.mockReturnValue({ data: mockAnalytics, isLoading: false });

    const { result } = renderHook(() => useAdminContent());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.bots).toEqual(mockBots);
    expect(result.current.totals).toEqual(mockAnalytics.totals);
    expect(result.current.conversionRate).toBe("25.0"); // (5 / 20) * 100

    // pieData filters out 0 leads
    expect(result.current.pieData).toEqual([
      { name: "Old Bot", value: 2 },
      { name: "New Bot With A Very Long Name Indeed", value: 3 },
    ]);

    // botBarData truncates names > 10 chars
    expect(result.current.botBarData).toEqual([
      {
        name: "Old Bot",
        Interactions: 10,
        ContactsCollected: "2",
      },
      {
        name: "New Bot Wi…",
        Interactions: 10,
        ContactsCollected: "3",
      },
    ]);

    // recentBots sorted by created_at descending and sliced to 4
    expect(result.current.recentBots).toHaveLength(4);
    expect(result.current.recentBots[0].id).toBe("bot-2");
    expect(result.current.recentBots[1].id).toBe("bot-5");
  });

  it("should return 0.0 conversionRate when total_conversations is 0 or missing", () => {
    mockedUseBots.mockReturnValue({ data: [], isLoading: false });
    mockedUseAnalytics.mockReturnValue({ data: { totals: { total_conversations: 0, total_leads: 0 } }, isLoading: false });

    const { result } = renderHook(() => useAdminContent());
    expect(result.current.conversionRate).toBe("0.0");
  });

  it("should format dates correctly using formatDate helper", () => {
    mockedUseBots.mockReturnValue({ data: [], isLoading: false });
    mockedUseAnalytics.mockReturnValue({ data: undefined, isLoading: false });

    const { result } = renderHook(() => useAdminContent());
    const formatted = result.current.formatDate("2025-01-15T00:00:00Z");
    expect(formatted).toContain("Jan");
    expect(formatted).toContain("15");
    expect(formatted).toContain("2025");
    expect(result.current.formatDate("")).toBe("");
  });
});
