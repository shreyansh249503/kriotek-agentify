import { runLeadAgent } from "./leadAgent";
import { generateObject } from "ai";

jest.mock("ai", () => ({
  generateObject: jest.fn(),
}));
jest.mock("@ai-sdk/google", () => ({
  google: jest.fn(),
}));

describe("runLeadAgent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  it("should return isComplete true when name and email are already in knownInfo", async () => {
    const knownInfo = {
      name: "Jane Lead",
      email: "jane@example.com",
    };

    const conversation: { role: "user" | "assistant"; content: string }[] = [
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi Jane!" },
    ];

    const decision = await runLeadAgent(conversation, null, knownInfo);

    expect(decision).toEqual({
      collectedInfo: {
        name: "Jane Lead",
        email: "jane@example.com",
      },
      missingFields: [],
      isComplete: true,
    });
    expect(generateObject).not.toHaveBeenCalled();
  });

  it("should extract name from conversation history when bot previously asked for name", async () => {
    (generateObject as jest.Mock).mockResolvedValueOnce({
      object: { email: "alex@example.com" },
    });

    const conversation: { role: "user" | "assistant"; content: string }[] = [
      { role: "assistant", content: "May I know your name?" },
      { role: "user", content: "Alex Smith" },
      { role: "user", content: "My email is alex@example.com" },
    ];

    const decision = await runLeadAgent(conversation, null, { name: null, email: null });

    expect(decision.collectedInfo.name).toBe("Alex Smith");
    expect(decision.collectedInfo.email).toBe("alex@example.com");
    expect(decision.isComplete).toBe(true);
  });

  it("should report missing fields when email is invalid or missing", async () => {
    (generateObject as jest.Mock).mockResolvedValueOnce({
      object: { email: undefined },
    });

    const conversation: { role: "user" | "assistant"; content: string }[] = [
      { role: "user", content: "I am interested in your pricing" },
    ];

    const decision = await runLeadAgent(conversation, null, { name: undefined, email: undefined });

    expect(decision.isComplete).toBe(false);
    expect(decision.missingFields).toEqual(["name", "email"]);
  });

  it("should handle generateObject model extraction error gracefully", async () => {
    jest.spyOn(console, "error").mockImplementationOnce(() => {});
    (generateObject as jest.Mock).mockRejectedValueOnce(new Error("AI Model Rate Limit"));

    const conversation: { role: "user" | "assistant"; content: string }[] = [
      { role: "user", content: "Hi" },
    ];

    const decision = await runLeadAgent(conversation, null, {});

    expect(decision.isComplete).toBe(false);
    expect(decision.missingFields).toEqual(["name", "email"]);
  });
});
