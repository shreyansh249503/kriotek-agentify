import axiosInstance from "@/lib/axios";
import { supabase } from "@/lib/supabase";
import { getAllBots, getBotById, createBot, updateBot } from "./bot.api";
import { Bot, CreateBotInput, UpdateBotInput } from "@/types/bot";

jest.mock("@/lib/axios");
jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
  },
}));

describe("bot.api services", () => {
  const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;
  const mockedGetSession = supabase.auth.getSession as jest.Mock;

  const mockBot: Bot = {
    id: "bot-123",
    public_key: "pk_test_123",
    name: "Customer Support Bot",
    description: "Handles customer inquiries",
    tone: "professional",
    primary_color: "#0070f3",
    created_at: "2026-01-01T00:00:00Z",
    contact_enabled: true,
    contact_email: "support@example.com",
    contact_prompt: "Ask for email",
    contact_email_message: "We will contact you soon",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllBots", () => {
    it("should fetch all bots from /api/bots endpoint", async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [mockBot] });

      const result = await getAllBots();

      expect(mockedAxios.get).toHaveBeenCalledWith("/api/bots");
      expect(result).toEqual([mockBot]);
    });
  });

  describe("getBotById", () => {
    it("should fetch a single bot by ID from /api/bots/:id", async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockBot });

      const result = await getBotById("bot-123");

      expect(mockedAxios.get).toHaveBeenCalledWith("/api/bots/bot-123");
      expect(result).toEqual(mockBot);
    });
  });

  describe("createBot", () => {
    it("should post new bot payload to /api/bots endpoint", async () => {
      const input: CreateBotInput = {
        name: "Sales Assistant",
        tone: "friendly",
        primaryColor: "#ff0000",
      };

      const mockResponse = { id: "bot-456", ...input };
      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await createBot(input);

      expect(mockedAxios.post).toHaveBeenCalledWith("/api/bots", input);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("updateBot", () => {
    it("should put updated bot data with authorization header from active supabase session", async () => {
      mockedGetSession.mockResolvedValueOnce({
        data: {
          session: {
            access_token: "mock-jwt-bearer-token",
          },
        },
      });

      const updateInput: UpdateBotInput = {
        id: "bot-123",
        name: "Updated Bot Name",
        tone: "casual",
      };

      mockedAxios.put.mockResolvedValueOnce({
        data: { success: true, bot: { ...mockBot, name: "Updated Bot Name" } },
      });

      const result = await updateBot("bot-123", updateInput);

      expect(mockedGetSession).toHaveBeenCalledTimes(1);
      expect(mockedAxios.put).toHaveBeenCalledWith(
        "/api/bots/bot-123",
        updateInput,
        {
          headers: {
            Authorization: "Bearer mock-jwt-bearer-token",
          },
        }
      );
      expect(result).toEqual({
        success: true,
        bot: { ...mockBot, name: "Updated Bot Name" },
      });
    });
  });
});
