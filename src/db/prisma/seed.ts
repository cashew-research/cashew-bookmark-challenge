import { PrismaClient } from "@prisma/client";
import { SEED_USERS } from "../../__tests__/fixtures/seed-data";

const prisma = new PrismaClient();

// =============================================================================
// Database Seed Script
// =============================================================================
// This script creates test users for the mock authentication system.
// Run with: npx prisma db seed
//
// User constants are defined in src/__tests__/fixtures/seed-data.ts
// so tests can reference them without magic strings.
// =============================================================================

async function main() {
  console.log("🌱 Seeding database...\n");

  for (const userData of Object.values(SEED_USERS)) {
    const user = await prisma.user.upsert({
      where: { id: userData.id },
      update: {},
      create: userData,
    });
    console.log(`  ✓ Created user: ${user.name} (${user.email})`);
  }

  console.log("\n✅ Seeding complete!");
  console.log("\nYou can now log in as any of these users in the app.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
