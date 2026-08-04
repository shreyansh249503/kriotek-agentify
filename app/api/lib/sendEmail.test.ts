import { sendUserEmail, sendOwnerNotification } from "./sendEmail";
import nodemailer from "nodemailer";

jest.mock("nodemailer");

describe("sendEmail utility", () => {
  const mockSendMail = jest.fn().mockResolvedValue({ messageId: "msg_123" });

  beforeEach(() => {
    jest.clearAllMocks();
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail,
    });
    process.env.GMAIL_USER = "support@example.com";
    process.env.GMAIL_APP_PASSWORD = "secret_password";
  });

  describe("sendUserEmail", () => {
    it("should send email to user via nodemailer transporter", async () => {
      await sendUserEmail({
        to: "customer@example.com",
        subject: "Welcome to Support",
        body: "Hello, how can we help?",
      });

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        service: "gmail",
        auth: {
          user: "support@example.com",
          pass: "secret_password",
        },
      });

      expect(mockSendMail).toHaveBeenCalledWith({
        from: '"Support" <support@example.com>',
        to: "customer@example.com",
        subject: "Welcome to Support",
        text: "Hello, how can we help?",
        html: "Hello, how can we help?",
      });
    });
  });

  describe("sendOwnerNotification", () => {
    it("should send formatted lead notification email to bot owner", async () => {
      await sendOwnerNotification({
        ownerEmail: "owner@example.com",
        botName: "Sales Assistant",
        leadData: {
          name: "John Lead",
          email: "john@lead.com",
          phone: "+1234567890",
        },
      });

      expect(mockSendMail).toHaveBeenCalledWith({
        from: '"Agentify" <support@example.com>',
        to: "owner@example.com",
        subject: "New Lead from Sales Assistant Chatbot",
        html: expect.stringContaining("John Lead"),
      });
    });
  });
});
