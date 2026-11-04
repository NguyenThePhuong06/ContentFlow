"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDefaultChannels = ensureDefaultChannels;
const db_js_1 = require("../db.js");
const crypto_js_1 = require("../utils/crypto.js");
const DEFAULT_CHANNELS = [
    { platform: 'FACEBOOK', name: 'Facebook Page Demo', accountId: 'fb_page_demo_101' },
    { platform: 'LINKEDIN', name: 'LinkedIn Company Demo', accountId: 'li_org_demo_202' },
    { platform: 'TWITTER', name: 'X / Twitter Feed Demo', accountId: 'tw_feed_demo_303' },
];
async function ensureDefaultChannels(userId) {
    await db_js_1.prisma.channel.createMany({
        data: DEFAULT_CHANNELS.map((channel) => {
            const encrypted = (0, crypto_js_1.encrypt)('demo_oauth_access_token_token123');
            return {
                userId,
                platform: channel.platform,
                accountName: channel.name,
                platformAccountId: channel.accountId,
                encryptedToken: encrypted.ciphertext,
                tokenIv: encrypted.iv,
                tokenAuthTag: encrypted.authTag,
            };
        }),
        skipDuplicates: true,
    });
}
