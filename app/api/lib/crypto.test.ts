import { encryptToken, decryptToken, decryptTokenWithKeyInfo } from "./crypto";

const env = process.env as Record<string, string | undefined>;

describe("crypto utility", () => {
  const sampleToken = "shpat_abc1234567890abcdef";
  const originalEnv = { ...process.env };

  afterEach(() => {
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) delete env[key];
    }
    Object.assign(process.env, originalEnv);
  });

  it("should encrypt and successfully decrypt a token", () => {
    const encrypted = encryptToken(sampleToken);
    expect(encrypted).not.toBe(sampleToken);
    expect(encrypted.startsWith("enc:v1:")).toBe(true);

    const decrypted = decryptToken(encrypted);
    expect(decrypted).toBe(sampleToken);
  });

  it("should not double-encrypt an already encrypted token", () => {
    const encryptedOnce = encryptToken(sampleToken);
    const encryptedTwice = encryptToken(encryptedOnce);
    expect(encryptedTwice).toBe(encryptedOnce);
  });

  it("should return plaintext unchanged if not encrypted (backward compatibility)", () => {
    expect(decryptToken("shpat_plain_unencrypted_token")).toBe("shpat_plain_unencrypted_token");
    expect(decryptToken("")).toBe("");
  });

  it("should throw an error on corrupted ciphertext or invalid auth tag", () => {
    const encrypted = encryptToken(sampleToken);
    const parts = encrypted.split(":");
    // Corrupt the ciphertext payload
    parts[3] = "deadbeef";
    const corrupted = parts.join(":");

    expect(() => decryptToken(corrupted)).toThrow("Failed to decrypt access token");
  });

  it("should throw on a malformed encrypted value", () => {
    expect(() => decryptToken("enc:v1:onlyonepart")).toThrow("Failed to decrypt access token");
  });

  describe("production key enforcement", () => {
    it("should throw when ENCRYPTION_KEY is missing in production", () => {
      env.NODE_ENV = "production";
      delete env.ENCRYPTION_KEY;
      expect(() => encryptToken(sampleToken)).toThrow("ENCRYPTION_KEY must be set");
    });

    it("should throw when ENCRYPTION_KEY is too short in production", () => {
      env.NODE_ENV = "production";
      env.ENCRYPTION_KEY = "too-short";
      expect(() => encryptToken(sampleToken)).toThrow("ENCRYPTION_KEY must be set");
    });

    it("should encrypt in production with a valid ENCRYPTION_KEY", () => {
      env.NODE_ENV = "production";
      env.ENCRYPTION_KEY = "a".repeat(32);
      expect(decryptToken(encryptToken(sampleToken))).toBe(sampleToken);
    });
  });

  describe("legacy keys and rotation", () => {
    it("should decrypt tokens encrypted with SHOPIFY_API_SECRET and flag them for re-encryption", () => {
      env.ENCRYPTION_KEY = "shopify-secret-used-as-old-implicit-key";
      const legacyEncrypted = encryptToken(sampleToken);

      env.SHOPIFY_API_SECRET = "shopify-secret-used-as-old-implicit-key";
      env.ENCRYPTION_KEY = "b".repeat(32);

      expect(decryptTokenWithKeyInfo(legacyEncrypted)).toEqual({
        plainText: sampleToken,
        needsReencrypt: true,
      });
    });

    it("should decrypt tokens encrypted with ENCRYPTION_KEY_LEGACY after rotation", () => {
      env.ENCRYPTION_KEY = "c".repeat(32);
      const oldEncrypted = encryptToken(sampleToken);

      env.ENCRYPTION_KEY_LEGACY = "c".repeat(32);
      env.ENCRYPTION_KEY = "d".repeat(32);

      expect(decryptToken(oldEncrypted)).toBe(sampleToken);
    });

    it("should not flag tokens encrypted with the current key", () => {
      env.ENCRYPTION_KEY = "e".repeat(32);
      expect(decryptTokenWithKeyInfo(encryptToken(sampleToken)).needsReencrypt).toBe(false);
    });

    it("should flag plaintext tokens for re-encryption", () => {
      expect(decryptTokenWithKeyInfo("shpat_plain").needsReencrypt).toBe(true);
    });

    it("should not decrypt with a production-disallowed dev key", () => {
      delete env.ENCRYPTION_KEY;
      delete env.ENCRYPTION_KEY_LEGACY;
      const devEncrypted = encryptToken(sampleToken); // NODE_ENV=test, no key -> dev-only key
      env.NODE_ENV = "production";
      env.ENCRYPTION_KEY = "f".repeat(32);
      delete env.SHOPIFY_API_SECRET;
      expect(() => decryptToken(devEncrypted)).toThrow("Failed to decrypt access token");
    });
  });
});
