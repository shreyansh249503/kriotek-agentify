import { encryptToken, decryptToken } from "./crypto";

describe("crypto utility", () => {
  const sampleToken = "shpat_abc1234567890abcdef";

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
});
