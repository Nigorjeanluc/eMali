// prisma/unseed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function unseed() {
  try {
    console.log('🧹 Reversing seed data…');

    // ────────────────────────────────────────────
    // 1. Tables that do NOT reference locations
    // ────────────────────────────────────────────
    await prisma.user.deleteMany(); // Users first (own properties etc.)
    await prisma.category.deleteMany(); // If you keep a category model
    await prisma.transaction.deleteMany(); // Payments, MoMo logs, etc.

    // ────────────────────────────────────────────
    // 2. Location‑dependent tables (child → parent)
    // ────────────────────────────────────────────
    await prisma.place.deleteMany(); // Depends on Sector
    await prisma.property.deleteMany(); // Depends on User / Location
    await prisma.rentalPeriod.deleteMany(); // Child of Property
    await prisma.location.deleteMany(); // Stand‑alone Location entries

    // ────────────────────────────────────────────
    // 3. Location hierarchy itself
    // ────────────────────────────────────────────
    await prisma.sector.deleteMany(); // child of District
    await prisma.district.deleteMany(); // child of Province
    await prisma.province.deleteMany(); // root table

    console.log('✅ All seed data deleted.');
  } catch (error) {
    console.error('❌ Error while unseeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

unseed();
