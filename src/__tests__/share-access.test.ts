// =============================================================================
// Share Access Tests - CANDIDATE IMPLEMENTS
// =============================================================================
// These tests verify that the share access control logic works correctly.
//
// The tests use:
// - `rawPrisma` to SET UP test data (bypasses ZenStack policies)
// - `getEnhancedClient(userId)` to TEST access (enforces policies)
//
// Requirements:
// - Test that owners can always access their collections
// - Test that PRIVATE collections are not accessible to others
// - Test that LINK_ACCESS collections are readable by anyone
// - Test that PASSWORD_PROTECTED collections require correct password
//
// -----------------------------------------------------------------------------
// NOTE ON @ts-expect-error COMMENTS
// -----------------------------------------------------------------------------
// The `@ts-expect-error` comments exist because the `Collection` and `Bookmark`
// models do not exist yet in the schema. TypeScript cannot recognize these
// models on the Prisma client until you implement them.
//
// Once you have:
// 1. Added the Collection and Bookmark models to `src/db/schema.zmodel`
// 2. Run `pnpm db:generate` to regenerate the Prisma client
//
// The @ts-expect-error comments will start showing TypeScript errors because
// the models now exist. **Remove all @ts-expect-error comments** before
// submitting your solution — they should no longer be needed.
// =============================================================================

import { describe, it, expect, beforeEach, afterEach, afterAll } from "vitest";
import {
  rawPrisma,
  getEnhancedClient,
  createTestUsers,
  cleanupTestData,
  disconnectDb,
} from "./fixtures/db";

// -----------------------------------------------------------------------------
// Test Cases
// -----------------------------------------------------------------------------

describe("Collection Share Access", () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await disconnectDb();
  });

  describe("Owner Access", () => {
    it("owner can access their PRIVATE collection", async () => {
      const { owner } = await createTestUsers();

      // Create collection with raw prisma (bypasses policies for test setup)
      // @ts-expect-error - Collection model may not exist yet
      const collection = await rawPrisma.collection.create({
        data: {
          name: "My Private Collection",
          ownerId: owner.id,
          shareMode: "PRIVATE",
        },
      });

      // Test access with enhanced client (enforces policies)
      const ownerClient = getEnhancedClient(owner.id);
      // @ts-expect-error - Collection model may not exist yet
      const result = await ownerClient.collection.findUnique({
        where: { id: collection.id },
      });

      expect(result).not.toBeNull();
      expect(result?.name).toBe("My Private Collection");
      expect(result?.shareMode).toBe("PRIVATE");
    });

    it("owner can access their LINK_ACCESS collection", async () => {
      const { owner } = await createTestUsers();

      // @ts-expect-error - Collection model may not exist yet
      const collection = await rawPrisma.collection.create({
        data: {
          name: "Shared Link Collection",
          ownerId: owner.id,
          shareMode: "LINK_ACCESS",
        },
      });

      const ownerClient = getEnhancedClient(owner.id);
      // @ts-expect-error - Collection model may not exist yet
      const result = await ownerClient.collection.findUnique({
        where: { id: collection.id },
      });

      expect(result).not.toBeNull();
      expect(result?.shareMode).toBe("LINK_ACCESS");
    });

    it.todo("owner can access their PASSWORD_PROTECTED collection");
  });

  describe("PRIVATE Collections", () => {
    it("PRIVATE collection is not accessible to other users", async () => {
      const { owner, other } = await createTestUsers();

      // @ts-expect-error - Collection model may not exist yet
      const collection = await rawPrisma.collection.create({
        data: {
          name: "Secret Collection",
          ownerId: owner.id,
          shareMode: "PRIVATE",
        },
      });

      // Other user tries to access - should be denied by policy
      const otherClient = getEnhancedClient(other.id);
      // @ts-expect-error - Collection model may not exist yet
      const result = await otherClient.collection.findUnique({
        where: { id: collection.id },
      });

      expect(result).toBeNull();
    });

    it("PRIVATE collection is not accessible to anonymous users", async () => {
      const { owner } = await createTestUsers();

      // @ts-expect-error - Collection model may not exist yet
      const collection = await rawPrisma.collection.create({
        data: {
          name: "Private Only",
          ownerId: owner.id,
          shareMode: "PRIVATE",
        },
      });

      // Anonymous access (null = no authenticated user)
      const anonClient = getEnhancedClient(null);
      // @ts-expect-error - Collection model may not exist yet
      const result = await anonClient.collection.findUnique({
        where: { id: collection.id },
      });

      expect(result).toBeNull();
    });
  });

  describe("LINK_ACCESS Collections", () => {
    it("LINK_ACCESS collection is readable by other users", async () => {
      const { owner, other } = await createTestUsers();

      // @ts-expect-error - Collection model may not exist yet
      const collection = await rawPrisma.collection.create({
        data: {
          name: "Public Link Collection",
          ownerId: owner.id,
          shareMode: "LINK_ACCESS",
        },
      });

      // Other user should be able to read
      const otherClient = getEnhancedClient(other.id);
      // @ts-expect-error - Collection model may not exist yet
      const result = await otherClient.collection.findUnique({
        where: { id: collection.id },
      });

      expect(result).not.toBeNull();
      expect(result?.name).toBe("Public Link Collection");
    });

    it("LINK_ACCESS collection is readable by anonymous users", async () => {
      const { owner } = await createTestUsers();

      // @ts-expect-error - Collection model may not exist yet
      const collection = await rawPrisma.collection.create({
        data: {
          name: "Anyone Can View",
          ownerId: owner.id,
          shareMode: "LINK_ACCESS",
        },
      });

      const anonClient = getEnhancedClient(null);
      // @ts-expect-error - Collection model may not exist yet
      const result = await anonClient.collection.findUnique({
        where: { id: collection.id },
      });

      expect(result).not.toBeNull();
      expect(result?.name).toBe("Anyone Can View");
    });

    it("LINK_ACCESS collection cannot be updated by other users", async () => {
      const { owner, other } = await createTestUsers();

      // @ts-expect-error - Collection model may not exist yet
      const collection = await rawPrisma.collection.create({
        data: {
          name: "Read Only For Others",
          ownerId: owner.id,
          shareMode: "LINK_ACCESS",
        },
      });

      // Other user tries to update - should be rejected by policy
      const otherClient = getEnhancedClient(other.id);

      await expect(
        // @ts-expect-error - Collection model may not exist yet
        otherClient.collection.update({
          where: { id: collection.id },
          data: { name: "Hacked!" },
        })
      ).rejects.toThrow();
    });

    it.todo("LINK_ACCESS collection cannot be deleted by other users");
  });

  describe("PASSWORD_PROTECTED Collections", () => {
    it.todo("PASSWORD_PROTECTED collection is visible but content is gated");
    it.todo("correct password grants access to content");
    it.todo("incorrect password does not grant access");
    it.todo("PASSWORD_PROTECTED cannot be edited by other users");
  });

  describe("Bookmark Access", () => {
    it("bookmarks in LINK_ACCESS collection are readable by others", async () => {
      const { owner, other } = await createTestUsers();

      // @ts-expect-error - Collection model may not exist yet
      const collection = await rawPrisma.collection.create({
        data: {
          name: "Shared Bookmarks",
          ownerId: owner.id,
          shareMode: "LINK_ACCESS",
        },
      });

      // @ts-expect-error - Bookmark model may not exist yet
      const bookmark = await rawPrisma.bookmark.create({
        data: {
          title: "Cool Website",
          url: "https://example.com",
          collectionId: collection.id,
        },
      });

      // Other user should see the bookmark
      const otherClient = getEnhancedClient(other.id);
      // @ts-expect-error - Bookmark model may not exist yet
      const result = await otherClient.bookmark.findUnique({
        where: { id: bookmark.id },
      });

      expect(result).not.toBeNull();
      expect(result?.title).toBe("Cool Website");
    });

    it("bookmarks in PRIVATE collection are not accessible to others", async () => {
      const { owner, other } = await createTestUsers();

      // @ts-expect-error - Collection model may not exist yet
      const collection = await rawPrisma.collection.create({
        data: {
          name: "Private Bookmarks",
          ownerId: owner.id,
          shareMode: "PRIVATE",
        },
      });

      // @ts-expect-error - Bookmark model may not exist yet
      await rawPrisma.bookmark.create({
        data: {
          title: "Secret Link",
          url: "https://secret.com",
          collectionId: collection.id,
        },
      });

      // Other user should NOT see bookmarks
      const otherClient = getEnhancedClient(other.id);
      // @ts-expect-error - Bookmark model may not exist yet
      const results = await otherClient.bookmark.findMany({
        where: { collectionId: collection.id },
      });

      expect(results).toHaveLength(0);
    });

    it("only collection owner can create bookmarks", async () => {
      const { owner, other } = await createTestUsers();

      // @ts-expect-error - Collection model may not exist yet
      const collection = await rawPrisma.collection.create({
        data: {
          name: "Owner Only Bookmarks",
          ownerId: owner.id,
          shareMode: "LINK_ACCESS",
        },
      });

      // Other user tries to add a bookmark - should fail
      const otherClient = getEnhancedClient(other.id);

      await expect(
        // @ts-expect-error - Bookmark model may not exist yet
        otherClient.bookmark.create({
          data: {
            title: "Unauthorized Bookmark",
            url: "https://hacker.com",
            collectionId: collection.id,
          },
        })
      ).rejects.toThrow();
    });

    it.todo("only collection owner can delete bookmarks");
  });
});
