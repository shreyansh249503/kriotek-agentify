import nodemailer from "nodemailer";

jest.mock("nodemailer");

type EmailModule = typeof import("./sendEmail");

describe("sendEmail utility", () => {
  const mockSendMail = jest.fn().mockResolvedValue({ messageId: "msg_123" });
  const originalEnv = { ...process.env };

  // The transport is cached per module instance, so each test loads a fresh copy.
  const loadModule = (): EmailModule => {
    let mod!: EmailModule;
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      mod = require("./sendEmail");
    });
    return mod;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail: mockSendMail });
    for (const key of ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "EMAIL_FROM", "GMAIL_USER", "GMAIL_APP_PASSWORD"]) {
      delete process.env[key];
    }
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("transport selection", () => {
    it("uses generic SMTP settings when SMTP_HOST is set", async () => {
      Object.assign(process.env, {
        SMTP_HOST: "smtp.resend.com",
        SMTP_PORT: "465",
        SMTP_USER: "resend",
        SMTP_PASS: "re_secret",
        EMAIL_FROM: "Agentify <no-reply@agentify.example>",
      });

      await loadModule().sendUserEmail({ to: "a@b.com", subject: "Hi", body: "Hello" });

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: "smtp.resend.com",
        port: 465,
        secure: true,
        auth: { user: "resend", pass: "re_secret" },
      });
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({ from: "Agentify <no-reply@agentify.example>" })
      );
    });

    it("defaults to port 587 with STARTTLS", async () => {
      Object.assign(process.env, { SMTP_HOST: "smtp.postmarkapp.com", SMTP_USER: "u", SMTP_PASS: "p" });

      await loadModule().sendUserEmail({ to: "a@b.com", subject: "Hi", body: "Hello" });

      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({ port: 587, secure: false })
      );
    });

    it("falls back to the legacy Gmail config when SMTP_HOST is not set", async () => {
      Object.assign(process.env, { GMAIL_USER: "support@example.com", GMAIL_APP_PASSWORD: "secret_password" });

      await loadModule().sendUserEmail({ to: "user@example.com", subject: "Welcome", body: "Hello there" });

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        service: "gmail",
        auth: { user: "support@example.com", pass: "secret_password" },
      });
      expect(mockSendMail).toHaveBeenCalledWith({
        from: '"Support" <support@example.com>',
        to: "user@example.com",
        subject: "Welcome",
        text: "Hello there",
        html: "Hello there",
      });
    });

    it("reuses one transport across sends", async () => {
      Object.assign(process.env, { SMTP_HOST: "smtp.example.com" });
      const mod = loadModule();

      await mod.sendUserEmail({ to: "a@b.com", subject: "1", body: "1" });
      await mod.sendUserEmail({ to: "a@b.com", subject: "2", body: "2" });

      expect(nodemailer.createTransport).toHaveBeenCalledTimes(1);
    });
  });

  describe("sendOwnerNotification", () => {
    beforeEach(() => {
      Object.assign(process.env, { GMAIL_USER: "support@example.com", GMAIL_APP_PASSWORD: "secret_password" });
    });

    it("should send formatted lead notification email to bot owner", async () => {
      await loadModule().sendOwnerNotification({
        ownerEmail: "owner@example.com",
        botName: "Sales Assistant",
        leadData: { name: "John Lead", email: "john@example.com", phone: "+1234567890" },
      });

      expect(mockSendMail).toHaveBeenCalledWith({
        from: '"Agentify" <support@example.com>',
        to: "owner@example.com",
        subject: "New Lead from Sales Assistant Chatbot",
        html: expect.stringContaining("John Lead"),
      });
    });

    it("escapes visitor-supplied lead details so they can't inject markup", async () => {
      await loadModule().sendOwnerNotification({
        ownerEmail: "owner@example.com",
        botName: "Shop <b>Bot</b>",
        leadData: {
          name: '<a href="https://evil.example">Click to verify</a>',
          email: 'x@y.com"><script>alert(1)</script>',
          phone: "<img src=x onerror=alert(1)>",
        },
      });

      const html: string = mockSendMail.mock.calls[0][0].html;
      expect(html).not.toContain('<a href="https://evil.example">');
      expect(html).not.toContain("<script>");
      expect(html).not.toContain("<img src=x");
      expect(html).toContain("&lt;a href=&quot;https://evil.example&quot;&gt;");
      expect(html).toContain("Shop &lt;b&gt;Bot&lt;/b&gt;");
    });
  });
});
