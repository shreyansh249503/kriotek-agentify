import { generateEmbedScript, generateReactEmbedScript } from "./embed";

describe("embed script generators", () => {
  const originalEnv = process.env.NEXT_PUBLIC_WIDGET_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_WIDGET_URL = "https://widget.example.com";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_WIDGET_URL = originalEnv;
  });

  describe("generateEmbedScript", () => {
    it("should generate a valid HTML script tag with the provided public key", () => {
      const publicKey = "test-bot-key-123";
      const result = generateEmbedScript(publicKey);

      expect(result).toContain(`bot-id="test-bot-key-123"`);
      expect(result).toContain(`src="https://widget.example.com/widget.js"`);
      expect(result).toContain("<script");
      expect(result).toContain("</script>");
    });
  });

  describe("generateReactEmbedScript", () => {
    it("should generate a valid Next.js Script component string with the provided public key", () => {
      const publicKey = "test-bot-key-456";
      const result = generateReactEmbedScript(publicKey);

      expect(result).toContain(`import Script from "next/script";`);
      expect(result).toContain(`<Script`);
      expect(result).toContain(`bot-id="test-bot-key-456"`);
      expect(result).toContain(`src="https://widget.example.com/widget.js"`);
    });
  });
});
