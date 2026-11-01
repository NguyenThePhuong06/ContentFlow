"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
const node_crypto_1 = __importDefault(require("node:crypto"));
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard 96-bit IV recommended for GCM
// Ensure 32-byte key from APP_SECRET using SHA-256 digest
const getKey = () => {
    const secret = process.env.APP_SECRET || 'fallback-key-should-be-in-env-32b';
    return node_crypto_1.default.createHash('sha256').update(secret).digest();
};
/**
 * Encrypt sensitive plain text (e.g. OAuth Tokens) using AES-256-GCM
 */
function encrypt(plainText) {
    const iv = node_crypto_1.default.randomBytes(IV_LENGTH);
    const cipher = node_crypto_1.default.createCipheriv(ALGORITHM, getKey(), iv);
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
function decrypt(payload) {
    const decipher = node_crypto_1.default.createDecipheriv(ALGORITHM, getKey(), Buffer.from(payload.iv, 'hex'));
    decipher.setAuthTag(Buffer.from(payload.authTag, 'hex'));
    let decrypted = decipher.update(payload.ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
