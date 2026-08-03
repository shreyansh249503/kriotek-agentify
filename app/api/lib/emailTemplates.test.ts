import { generateUserConfirmationTemplate } from "./emailTemplates";

describe("emailTemplates", () => {
  describe("generateUserConfirmationTemplate", () => {
    it("should render full confirmation email template with custom message", () => {
      const result = generateUserConfirmationTemplate({
        userName: "Alice Smith",
        companyName: "Acme Corp",
        companyDescription: "Leading AI Automation Solutions",
        customMessage: "Thank you for booking a demo with us!",
        userEmail: "alice@example.com",
        userPhone: "+1234567890",
      });

      expect(result).toContain("Hello Alice Smith,");
      expect(result).toContain("Acme Corp");
      expect(result).toContain("Leading AI Automation Solutions");
      expect(result).toContain("Thank you for booking a demo with us!");
      expect(result).toContain("class=\"message-box\"");
      expect(result).toContain("typically within <strong>24 hours</strong>.");
    });

    it("should render confirmation email template without custom message when omitted", () => {
      const result = generateUserConfirmationTemplate({
        userName: "Bob Jones",
        companyName: "Kriotek AI",
        companyDescription: "Conversational Agent Platform",
        userEmail: "bob@example.com",
        userPhone: "+9876543210",
      });

      expect(result).toContain("Hello Bob Jones,");
      expect(result).toContain("Kriotek AI");
      expect(result).not.toContain("class=\"message-box\"");
    });
  });
});
