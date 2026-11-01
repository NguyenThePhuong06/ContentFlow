import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard 96-bit IV recommended for GCM

// Ensure 32-byte key from APP_SECRET using SHA-256 digest
const getKey = (): Buffer => {
  const secret = process.env.APP_SECRET || 'fallback-key-should-be-in-env-32b';
  return crypto.createHash('sha256').update(secret).digest();
};

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  authTag: string;
}

/**
 * Encrypt sensitive plain text (e.g. OAuth Tokens) using AES-256-GCM
 */
export function encrypt(plainText: string): EncryptedPayload {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

  let ciphertext = cipher.update(plainText, 'utf8', 'hex');
  ciphertext += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  return {
    ciphertext,
    iv: iv.toString('hex'),
    authTag,
  };
}

/**
 * Decrypt AES-256-GCM encrypted payload
 */
export function decrypt(payload: EncryptedPayload): string {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getKey(),
    Buffer.from(payload.iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(payload.authTag, 'hex'));

  let decrypted = decipher.update(payload.ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

