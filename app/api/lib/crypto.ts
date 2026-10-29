import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // Standard for GCM
const PREFIX = "enc:v1:";
const MIN_SECRET_LENGTH = 32;
const DEV_ONLY_SECRET = "agentify-dev-only-encryption-secret-not-for-production";

let warnedAboutDevKey = false;

function deriveKey(secret: string): Buffer {
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Returns the key used for all new encryptions.
 * Production requires ENCRYPTION_KEY (>= 32 chars); dev/test fall back to a dev-only key.
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY;

  if (secret && secret.length >= MIN_SECRET_LENGTH) {
    return deriveKey(secret);
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      `ENCRYPTION_KEY must be set to at least ${MIN_SECRET_LENGTH} characters in production`,
    );
  }

  if (!warnedAboutDevKey && process.env.NODE_ENV !== "test") {
    warnedAboutDevKey = true;
    console.warn("[crypto] ENCRYPTION_KEY is not set; using a dev-only key. Do not use in production.");
  }
  return deriveKey(DEV_ONLY_SECRET);
}

/**
 * Keys tried after the primary key when decrypting, so tokens encrypted before a key
 * rotation stay readable until scripts/reencrypt-shopify-tokens.mjs has been run.
 * SHOPIFY_API_SECRET is included because it was the implicit key before ENCRYPTION_KEY existed.
 */
function getLegacyKeys(): Buffer[] {
  const secrets = [
    process.env.ENCRYPTION_KEY_LEGACY,
    process.env.SHOPIFY_API_SECRET,
    process.env.NODE_ENV === "production" ? undefined : DEV_ONLY_SECRET,
  ];
  return secrets.filter((s): s is string => Boolean(s)).map(deriveKey);
}

function decryptWithKey(iv: Buffer, authTag: Buffer, encrypted: Buffer, key: Buffer): string {
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: 16 });
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
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
 * Decrypts sensitive text encrypted with encryptToken, trying the current key first and then legacy keys.
 * Gracefully returns the original string if unencrypted for backward compatibility.
 */
export function decryptToken(cipherText: string): string {
  return decryptTokenWithKeyInfo(cipherText).plainText;
}

/**
 * Like decryptToken, but also reports whether the value needs re-encrypting with the current key
 * (it was plaintext or encrypted with a legacy key).
 */
export function decryptTokenWithKeyInfo(cipherText: string): { plainText: string; needsReencrypt: boolean } {
  if (!cipherText) {
    return { plainText: cipherText, needsReencrypt: false };
  }
  if (!cipherText.startsWith(PREFIX)) {
    return { plainText: cipherText, needsReencrypt: true };
  }

  const [ivHex, authTagHex, encryptedHex] = cipherText.slice(PREFIX.length).split(":");
  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error("Failed to decrypt access token");
  }

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");

  const primaryKey = getEncryptionKey();
  const candidates = [primaryKey, ...getLegacyKeys().filter((k) => !k.equals(primaryKey))];

  for (const [index, key] of candidates.entries()) {
    try {
      return { plainText: decryptWithKey(iv, authTag, encrypted, key), needsReencrypt: index > 0 };
    } catch {
      // Wrong key or tampered data; try the next candidate.
    }
  }

  console.error("[crypto] Failed to decrypt token with current or legacy keys");
  throw new Error("Failed to decrypt access token");
}
