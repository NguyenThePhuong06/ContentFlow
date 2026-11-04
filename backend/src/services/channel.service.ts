import { Platform } from '@prisma/client';
import { prisma } from '../db.js';
import { encrypt } from '../utils/crypto.js';

const DEFAULT_CHANNELS: Array<{ platform: Platform; name: string; accountId: string }> = [
  { platform: 'FACEBOOK', name: 'Facebook Page Demo', accountId: 'fb_page_demo_101' },
  { platform: 'LINKEDIN', name: 'LinkedIn Company Demo', accountId: 'li_org_demo_202' },
  { platform: 'TWITTER', name: 'X / Twitter Feed Demo', accountId: 'tw_feed_demo_303' },
];

export async function ensureDefaultChannels(userId: string): Promise<void> {
  await prisma.channel.createMany({
    data: DEFAULT_CHANNELS.map((channel) => {
      const encrypted = encrypt('demo_oauth_access_token_token123');
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
