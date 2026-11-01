import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from '../utils/crypto.js';

describe('AES-256-GCM Crypto Util', () => {
  it('should encrypt and decrypt string accurately', () => {
    const rawToken = 'oauth_access_token_super_secret_999888';
    const encrypted = encrypt(rawToken);

    expect(encrypted.ciphertext).toBeDefined();
    expect(encrypted.iv).toHaveLength(24); // 12 bytes = 24 hex chars
    expect(encrypted.authTag).toHaveLength(32); // 16 bytes = 32 hex chars

    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(rawToken);
  });

  it('should fail decryption if authTag is tampered', () => {
    const rawToken = 'secret-data';
    const encrypted = encrypt(rawToken);

    // Tamper auth tag
    const tampered = { ...encrypted, authTag: '00'.repeat(16) };
    expect(() => decrypt(tampered)).toThrow();
  });
});

