"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const password_js_1 = require("../utils/password.js");
(0, vitest_1.describe)('password hashing', () => {
    (0, vitest_1.it)('verifies the correct password and rejects an incorrect one', async () => {
        const password = 'correct-horse-battery-staple';
        const storedHash = await (0, password_js_1.hashPassword)(password);
        (0, vitest_1.expect)(storedHash).not.toContain(password);
        (0, vitest_1.expect)(await (0, password_js_1.verifyPassword)(password, storedHash)).toBe(true);
        (0, vitest_1.expect)(await (0, password_js_1.verifyPassword)('incorrect-password', storedHash)).toBe(false);
    });
    (0, vitest_1.it)('rejects malformed stored hashes', async () => {
        (0, vitest_1.expect)(await (0, password_js_1.verifyPassword)('password', 'not-a-valid-hash')).toBe(false);
    });
});
