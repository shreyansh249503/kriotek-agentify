import axiosInstance from "@/lib/axios";
import { getAnalytics } from "./analytics.api";
import { AnalyticsData } from "@/types/analytics";

jest.mock("@/lib/axios");

describe("analytics.api services", () => {
  const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

  const mockAnalyticsData: AnalyticsData = {
    convosPerBot: [
      {
        bot_id: "bot-1",
        bot_name: "Sales Bot",
        total_conversations: 42,
        total_messages: 180,
        conversations_this_week: 10,
        conversations_this_month: 30,
      },
    ],
    leadsPerBot: [
      {
        bot_id: "bot-1",
        bot_name: "Sales Bot",
        total_leads: 12,
      },
    ],
    monthlyTrend: [
      {
        month: "Jan",
        conversations: 42,
        leads: 12,
      },
    ],
    totals: {
      total_conversations: 42,
      total_messages: 180,
      total_leads: 12,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAnalytics", () => {
    it("should fetch analytics metrics from /api/analytics endpoint", async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockAnalyticsData });

      const result = await getAnalytics();

      expect(mockedAxios.get).toHaveBeenCalledWith("/api/analytics");
      expect(result).toEqual(mockAnalyticsData);
    });
  });
});
