import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '../utils/password.js';

describe('password hashing', () => {
  it('verifies the correct password and rejects an incorrect one', async () => {
    const password = 'correct-horse-battery-staple';
    const storedHash = await hashPassword(password);

    expect(storedHash).not.toContain(password);
    expect(await verifyPassword(password, storedHash)).toBe(true);
    expect(await verifyPassword('incorrect-password', storedHash)).toBe(false);
  });

  it('rejects malformed stored hashes', async () => {
    expect(await verifyPassword('password', 'not-a-valid-hash')).toBe(false);
  });
});
