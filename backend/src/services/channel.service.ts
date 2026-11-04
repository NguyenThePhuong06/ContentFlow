import { Platform } from '@prisma/client';
import { prisma } from '../db.js';
import { encrypt } from '../utils/crypto.js';

const DEFAULT_CHANNELS: Array<{ platform: Platform; name: string; accountId: string }> = [
  { platform: 'FACEBOOK', name: 'Facebook Page Demo', accountId: 'fb_page_demo_101' },
  { platform: 'INSTAGRAM', name: 'Instagram Business Demo', accountId: 'ig_business_demo_404' },
  { platform: 'TIKTOK', name: 'TikTok Account Demo', accountId: 'tiktok_account_demo_505' },
  { platform: 'LINKEDIN', name: 'LinkedIn Company Demo', accountId: 'li_org_demo_202' },
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
