import axiosInstance from "@/lib/axios";
import { getAllLeads, Lead } from "./lead.api";

jest.mock("@/lib/axios");

describe("lead.api services", () => {
  const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

  const mockLead: Lead = {
    id: "lead-1",
    bot_id: "bot-123",
    name: "Jane Lead",
    email: "jane@example.com",
    phone: "+1234567890",
    bot_name: "Support Assistant",
    created_at: "2026-01-25T14:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllLeads", () => {
    it("should fetch all leads from /api/leads endpoint", async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [mockLead] });

      const result = await getAllLeads();

      expect(mockedAxios.get).toHaveBeenCalledWith("/api/leads");
      expect(result).toEqual([mockLead]);
    });
  });
});
