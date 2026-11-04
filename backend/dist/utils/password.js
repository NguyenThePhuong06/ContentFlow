"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
const node_crypto_1 = require("node:crypto");
const SALT_LENGTH = 16;
const KEY_LENGTH = 64;
function deriveKey(password, salt) {
    return new Promise((resolve, reject) => {
        (0, node_crypto_1.scrypt)(password, salt, KEY_LENGTH, (error, key) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(key);
        });
    });
}
async function hashPassword(password) {
    const salt = (0, node_crypto_1.randomBytes)(SALT_LENGTH);
    const key = await deriveKey(password, salt);
    return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`;
}
async function verifyPassword(password, storedHash) {
    const [algorithm, saltHex, keyHex] = storedHash.split('$');
    if (algorithm !== 'scrypt' ||
        !saltHex ||
        !/^[a-f0-9]{32}$/i.test(saltHex) ||
        !keyHex ||
        !/^[a-f0-9]{128}$/i.test(keyHex)) {
        return false;
    }
    const expectedKey = Buffer.from(keyHex, 'hex');
    const actualKey = await deriveKey(password, Buffer.from(saltHex, 'hex'));
    return (0, node_crypto_1.timingSafeEqual)(actualKey, expectedKey);
}
