"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const crypto_js_1 = require("../utils/crypto.js");
(0, vitest_1.describe)('AES-256-GCM Crypto Util', () => {
    (0, vitest_1.it)('should encrypt and decrypt string accurately', () => {
        const rawToken = 'oauth_access_token_super_secret_999888';
        const encrypted = (0, crypto_js_1.encrypt)(rawToken);
        (0, vitest_1.expect)(encrypted.ciphertext).toBeDefined();
        (0, vitest_1.expect)(encrypted.iv).toHaveLength(24); // 12 bytes = 24 hex chars
        (0, vitest_1.expect)(encrypted.authTag).toHaveLength(32); // 16 bytes = 32 hex chars
        const decrypted = (0, crypto_js_1.decrypt)(encrypted);
        (0, vitest_1.expect)(decrypted).toBe(rawToken);
    });
    (0, vitest_1.it)('should fail decryption if authTag is tampered', () => {
        const rawToken = 'secret-data';
        const encrypted = (0, crypto_js_1.encrypt)(rawToken);
        // Tamper auth tag
        const tampered = { ...encrypted, authTag: '00'.repeat(16) };
        (0, vitest_1.expect)(() => (0, crypto_js_1.decrypt)(tampered)).toThrow();
    });
});
