// =============================================================================
// Shared Seed Data Constants
// =============================================================================
// These constants are shared between:
// - src/db/prisma/seed.ts (database seeding)
// - Test fixtures (test setup/teardown)
//
// This ensures tests can reference seeded users without magic strings.
// =============================================================================

export const SEED_USERS = {
  alice: {
    id: "user_alice",
    email: "alice@example.com",
    name: "Alice Johnson",
  },
  bob: {
    id: "user_bob",
    email: "bob@example.com",
    name: "Bob Smith",
  },
  charlie: {
    id: "user_charlie",
    email: "charlie@example.com",
    name: "Charlie Brown",
  },
} as const;

export type SeedUser = (typeof SEED_USERS)[keyof typeof SEED_USERS];
export type SeedUserId = SeedUser["id"];
