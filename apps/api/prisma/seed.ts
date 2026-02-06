/**
 * Seed script: creates 3 users — 1 viewer, 2 admins.
 * Run: npm run db:seed (from repo root or apps/api)
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const USERS = [
  { email: 'viewer@aem-residence.com', password: 'viewer', role: 'VIEWER' as const },
  { email: 'admin@aem-residence.com', password: 'admin', role: 'ADMIN' as const },
  { email: 'admin2@aem-residence.com', password: 'admin2', role: 'ADMIN' as const },
];

async function main() {
  for (const u of USERS) {
    const passwordHash = await bcrypt.hash(u.password, 12);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash, role: u.role },
      create: {
        email: u.email,
        passwordHash,
        role: u.role,
      },
    });
    console.log(`Seeded ${user.role}: ${user.email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
