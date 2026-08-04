import { POST, OPTIONS } from "./route";
import { getUserFromRequest } from "../lib/auth";
import { getDb } from "../lib/db";
import { ingestDocument } from "../lib/ingest";

jest.mock("../lib/auth");
jest.mock("../lib/db");
jest.mock("../lib/ingest");

describe("API: /api/ingest", () => {
  const mockUser = { id: "user_123", email: "user@example.com" };
  const mockBotRepo = {
    exists: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getDb as jest.Mock).mockResolvedValue({
      getRepository: jest.fn().mockReturnValue(mockBotRepo),
    });
  });

  describe("OPTIONS", () => {
    it("should respond with 204 status and CORS headers", async () => {
      const res = await OPTIONS();
      expect(res.status).toBe(204);
      expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    });
  });

  describe("POST", () => {
    it("should return 401 if user is not authenticated", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValueOnce(null);

      const req = new Request("http://localhost/api/ingest", {
        method: "POST",
        body: JSON.stringify({ publicKey: "pk_123", content: "Document text" }),
      });

      const res = await POST(req);
      const text = await res.text();

      expect(res.status).toBe(401);
      expect(text).toBe("Unauthorized");
    });

    it("should return 400 if publicKey or content is missing", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValueOnce(mockUser);

      const req = new Request("http://localhost/api/ingest", {
        method: "POST",
        body: JSON.stringify({ publicKey: "pk_123" }),
      });

      const res = await POST(req);
      const text = await res.text();

      expect(res.status).toBe(400);
      expect(text).toBe("Missing botId or content");
    });

    it("should return 403 if bot does not exist or belong to the user", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValueOnce(mockUser);
      mockBotRepo.exists.mockResolvedValueOnce(false);

      const req = new Request("http://localhost/api/ingest", {
        method: "POST",
        body: JSON.stringify({ publicKey: "pk_other_user", content: "Document text" }),
      });

      const res = await POST(req);
      const text = await res.text();

      expect(res.status).toBe(403);
      expect(mockBotRepo.exists).toHaveBeenCalledWith({
        where: { public_key: "pk_other_user", user_id: mockUser.id },
      });
      expect(text).toBe("Forbidden");
    });

    it("should ingest document and return success status", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValueOnce(mockUser);
      mockBotRepo.exists.mockResolvedValueOnce(true);
      (ingestDocument as jest.Mock).mockResolvedValueOnce(undefined);

      const req = new Request("http://localhost/api/ingest", {
        method: "POST",
        body: JSON.stringify({ publicKey: "pk_123", content: "Sample documentation content" }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(ingestDocument).toHaveBeenCalledWith("pk_123", "Sample documentation content");
      expect(data).toEqual({ status: "success" });
    });
  });
});
