import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // Standard for GCM
const PREFIX = "enc:v1:";

function getEncryptionKey(): Buffer {
  const secret =
    process.env.ENCRYPTION_KEY ||
    process.env.SHOPIFY_API_SECRET ||
    "agentify_default_encryption_fallback_secret_32b";
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypts sensitive text (e.g. Shopify access tokens) using AES-256-GCM authenticated encryption.
 */
export function encryptToken(plainText: string): string {
  if (!plainText) return plainText;
  if (plainText.startsWith(PREFIX)) return plainText; // Already encrypted

  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: 16 });

  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return `${PREFIX}${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypts sensitive text encrypted with encryptToken.
 * Gracefully returns the original string if unencrypted for backward compatibility.
 */
export function decryptToken(cipherText: string): string {
  if (!cipherText || !cipherText.startsWith(PREFIX)) {
    return cipherText;
  }

  try {
    const raw = cipherText.slice(PREFIX.length);
    const [ivHex, authTagHex, encryptedHex] = raw.split(":");

    if (!ivHex || !authTagHex || !encryptedHex) {
      return cipherText;
    }

    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");
    const key = getEncryptionKey();

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: 16 });
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  } catch (err) {
    console.error("[crypto] Failed to decrypt token:", err);
    throw new Error("Failed to decrypt access token");
  }
}
