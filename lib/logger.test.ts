import { Logger, sanitizeLogData } from "./logger";

describe("Logger & PII Sanitization", () => {
  describe("sanitizeLogData", () => {
    it("redacts sensitive keys such as email, phone, token, and password", () => {
      const input = {
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "+15551234567",
        token: "shpat_1234567890",
        nested: {
          accessToken: "secret_token",
          password: "my-secret-password",
          okField: 42,
        },
      };

      const sanitized = sanitizeLogData(input) as Record<string, unknown>;
      expect(sanitized.name).toBe("Jane Doe");
      expect(sanitized.email).toBe("[REDACTED]");
      expect(sanitized.phone).toBe("[REDACTED]");
      expect(sanitized.token).toBe("[REDACTED]");
      const nested = sanitized.nested as Record<string, unknown>;
      expect(nested.accessToken).toBe("[REDACTED]");
      expect(nested.password).toBe("[REDACTED]");
      expect(nested.okField).toBe(42);
    });

    it("redacts embedded email addresses in text strings", () => {
      const text = "User contact is john.doe@sub.company.co.uk and reached out";
      const sanitized = sanitizeLogData(text);
      expect(sanitized).toBe("User contact is [REDACTED_EMAIL] and reached out");
    });

    it("handles Error objects safely without crashing", () => {
      const err = new Error("Failed connecting for admin@domain.com");
      const sanitized = sanitizeLogData(err) as { name: string; message: string };
      expect(sanitized.name).toBe("Error");
      expect(sanitized.message).toBe("Failed connecting for [REDACTED_EMAIL]");
    });
  });

  describe("Logger instance", () => {
    let stdoutSpy: jest.SpyInstance;
    let stderrSpy: jest.SpyInstance;

    beforeEach(() => {
      stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => true);
      stderrSpy = jest.spyOn(process.stderr, "write").mockImplementation(() => true);
    });

    afterEach(() => {
      stdoutSpy.mockRestore();
      stderrSpy.mockRestore();
      delete process.env.DEBUG_TESTS;
    });

    it("writes structured JSON to stdout when DEBUG_TESTS is set", () => {
      process.env.DEBUG_TESTS = "1";
      const logger = new Logger({ module: "test-module" });
      logger.info("Test message", { count: 5 });

      expect(stdoutSpy).toHaveBeenCalledTimes(1);
      const logLine = JSON.parse(stdoutSpy.mock.calls[0][0] as string);
      expect(logLine.level).toBe("info");
      expect(logLine.module).toBe("test-module");
      expect(logLine.msg).toBe("Test message");
      expect(logLine.count).toBe(5);
      expect(logLine.time).toBeDefined();
    });

    it("writes errors to stderr with error payload", () => {
      process.env.DEBUG_TESTS = "1";
      const logger = new Logger();
      const err = new Error("Something broke");
      logger.error("Operation failed", err, { botId: "bot-123" });

      expect(stderrSpy).toHaveBeenCalledTimes(1);
      const logLine = JSON.parse(stderrSpy.mock.calls[0][0] as string);
      expect(logLine.level).toBe("error");
      expect(logLine.msg).toBe("Operation failed");
      expect(logLine.botId).toBe("bot-123");
      expect(logLine.error.message).toBe("Something broke");
    });

    it("creates child loggers that inherit metadata", () => {
      process.env.DEBUG_TESTS = "1";
      const parent = new Logger({ service: "api" });
      const child = parent.child({ route: "/chat" });
      child.info("Handling request");

      expect(stdoutSpy).toHaveBeenCalledTimes(1);
      const logLine = JSON.parse(stdoutSpy.mock.calls[0][0] as string);
      expect(logLine.service).toBe("api");
      expect(logLine.route).toBe("/chat");
      expect(logLine.msg).toBe("Handling request");
    });
  });
});

