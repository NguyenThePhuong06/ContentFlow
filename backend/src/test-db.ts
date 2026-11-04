import dotenv from 'dotenv';
import path from 'node:path';

// Load from current directory and parent directory
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

console.log('Resolved DATABASE_URL:', process.env.DATABASE_URL);

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log('Success! Users count:', users.length);
    for (const u of users) {
      console.log('User:', u.id, u.email, u.role, u.status);
    }
  } catch (err: any) {
    console.error('Prisma connection error:', err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
