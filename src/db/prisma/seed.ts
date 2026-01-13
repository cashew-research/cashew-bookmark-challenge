import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// =============================================================================
// Database Seed Script
// =============================================================================
// This script creates test users for the mock authentication system.
// Run with: npx prisma db seed
// =============================================================================

const SEED_USERS = [
  {
    id: "user_alice",
    email: "alice@example.com",
    name: "Alice Johnson",
  },
  {
    id: "user_bob",
    email: "bob@example.com",
    name: "Bob Smith",
  },
  {
    id: "user_charlie",
    email: "charlie@example.com",
    name: "Charlie Brown",
  },
];

async function main() {
  console.log("🌱 Seeding database...\n");

  for (const userData of SEED_USERS) {
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
