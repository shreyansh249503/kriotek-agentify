import axiosInstance from "@/lib/axios";
import { getCurrentUser } from "./auth.api";

jest.mock("@/lib/axios");

describe("auth.api services", () => {
  const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCurrentUser", () => {
    it("should fetch current authenticated user profile from /api/me", async () => {
      const mockUser = { id: "user-123", email: "admin@example.com", name: "Admin User" };
      mockedAxios.get.mockResolvedValueOnce({ data: mockUser });

      const result = await getCurrentUser();

      expect(mockedAxios.get).toHaveBeenCalledWith("/api/me");
      expect(result).toEqual(mockUser);
    });
  });
});
