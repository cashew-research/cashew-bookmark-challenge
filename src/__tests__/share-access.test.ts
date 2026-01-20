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
import { hash } from "bcryptjs";
import { vi } from "vitest";
import {
  rawPrisma,
  getEnhancedClient,
  createTestUsers,
  cleanupTestData,
  disconnectDb,
} from "./fixtures/db";
import { verifySharePassword } from "../lib/actions/collections";

// Mock next/headers
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

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
      const collection = await rawPrisma.collection.create({
        data: {
          name: "My Private Collection",
          ownerId: owner.id,
          shareMode: "PRIVATE",
        },
      });

      // Test access with enhanced client (enforces policies)
      const ownerClient = getEnhancedClient(owner.id);
      const result = await ownerClient.collection.findUnique({
        where: { id: collection.id },
      });

      expect(result).not.toBeNull();
      expect(result?.name).toBe("My Private Collection");
      expect(result?.shareMode).toBe("PRIVATE");
    });

    it("owner can access their LINK_ACCESS collection", async () => {
      const { owner } = await createTestUsers();

      const collection = await rawPrisma.collection.create({
        data: {
          name: "Shared Link Collection",
          ownerId: owner.id,
          shareMode: "LINK_ACCESS",
        },
      });

      const ownerClient = getEnhancedClient(owner.id);

      const result = await ownerClient.collection.findUnique({
        where: { id: collection.id },
      });

      expect(result).not.toBeNull();
      expect(result?.shareMode).toBe("LINK_ACCESS");
    });

    it("owner can access their PASSWORD_PROTECTED collection", async () => {
      const { owner } = await createTestUsers();

      const hashedPassword = await hash("testpassword", 10);
      const collection = await rawPrisma.collection.create({
        data: {
          name: "Password Protected Collection",
          ownerId: owner.id,
          shareMode: "PASSWORD_PROTECTED",
          sharePassword: hashedPassword,
        },
      });

      const ownerClient = getEnhancedClient(owner.id);
      const result = await ownerClient.collection.findUnique({
        where: { id: collection.id },
      });

      expect(result).not.toBeNull();
      expect(result?.shareMode).toBe("PASSWORD_PROTECTED");
    });
  });

  describe("PRIVATE Collections", () => {
    it("PRIVATE collection is not accessible to other users", async () => {
      const { owner, other } = await createTestUsers();

      const collection = await rawPrisma.collection.create({
        data: {
          name: "Secret Collection",
          ownerId: owner.id,
          shareMode: "PRIVATE",
        },
      });

      // Other user tries to access - should be denied by policy
      const otherClient = getEnhancedClient(other.id);

      const result = await otherClient.collection.findUnique({
        where: { id: collection.id },
      });

      expect(result).toBeNull();
    });

    it("PRIVATE collection is not accessible to anonymous users", async () => {
      const { owner } = await createTestUsers();

      const collection = await rawPrisma.collection.create({
        data: {
          name: "Private Only",
          ownerId: owner.id,
          shareMode: "PRIVATE",
        },
      });

      // Anonymous access (null = no authenticated user)
      const anonClient = getEnhancedClient(null);

      const result = await anonClient.collection.findUnique({
        where: { id: collection.id },
      });

      expect(result).toBeNull();
    });
  });

  describe("LINK_ACCESS Collections", () => {
    it("LINK_ACCESS collection is readable by other users", async () => {
      const { owner, other } = await createTestUsers();

      const collection = await rawPrisma.collection.create({
        data: {
          name: "Public Link Collection",
          ownerId: owner.id,
          shareMode: "LINK_ACCESS",
        },
      });

      // Other user should be able to read
      const otherClient = getEnhancedClient(other.id);

      const result = await otherClient.collection.findUnique({
        where: { id: collection.id },
      });

      expect(result).not.toBeNull();
      expect(result?.name).toBe("Public Link Collection");
    });

    it("LINK_ACCESS collection is readable by anonymous users", async () => {
      const { owner } = await createTestUsers();

      const collection = await rawPrisma.collection.create({
        data: {
          name: "Anyone Can View",
          ownerId: owner.id,
          shareMode: "LINK_ACCESS",
        },
      });

      const anonClient = getEnhancedClient(null);

      const result = await anonClient.collection.findUnique({
        where: { id: collection.id },
      });

      expect(result).not.toBeNull();
      expect(result?.name).toBe("Anyone Can View");
    });

    it("LINK_ACCESS collection cannot be updated by other users", async () => {
      const { owner, other } = await createTestUsers();

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
        otherClient.collection.update({
          where: { id: collection.id },
          data: { name: "Hacked!" },
        }),
      ).rejects.toThrow();
    });

    it("LINK_ACCESS collection cannot be deleted by other users", async () => {
      const { owner, other } = await createTestUsers();

      const collection = await rawPrisma.collection.create({
        data: {
          name: "Undeletable by Others",
          ownerId: owner.id,
          shareMode: "LINK_ACCESS",
        },
      });

      // Other user tries to delete - should be rejected by policy
      const otherClient = getEnhancedClient(other.id);

      await expect(
        otherClient.collection.delete({
          where: { id: collection.id },
        }),
      ).rejects.toThrow();
    });
  });

  describe("PASSWORD_PROTECTED Collections", () => {
    it("PASSWORD_PROTECTED collection is visible to anonymous users", async () => {
      const { owner } = await createTestUsers();

      const hashedPassword = await hash("testpassword", 10);
      const collection = await rawPrisma.collection.create({
        data: {
          name: "Visible But Gated",
          ownerId: owner.id,
          shareMode: "PASSWORD_PROTECTED",
          sharePassword: hashedPassword,
        },
      });

      // Anonymous user should be able to see the collection metadata
      const anonClient = getEnhancedClient(null);
      const result = await anonClient.collection.findUnique({
        where: { id: collection.id },
      });

      expect(result).not.toBeNull();
      expect(result?.name).toBe("Visible But Gated");
      expect(result?.shareMode).toBe("PASSWORD_PROTECTED");
    });

    it("correct password grants access", async () => {
      const { owner } = await createTestUsers();

      const password = "correctpassword";
      const hashedPassword = await hash(password, 10);
      const collection = await rawPrisma.collection.create({
        data: {
          name: "Password Protected",
          slug: "test-slug",
          ownerId: owner.id,
          shareMode: "PASSWORD_PROTECTED",
          sharePassword: hashedPassword,
        },
      });

      const result = await verifySharePassword(collection.slug, password);
      expect(result.success).toBe(true);
    });

    it("incorrect password does not grant access", async () => {
      const { owner } = await createTestUsers();

      const hashedPassword = await hash("correctpassword", 10);
      const collection = await rawPrisma.collection.create({
        data: {
          name: "Password Protected",
          slug: "test-slug-wrong",
          ownerId: owner.id,
          shareMode: "PASSWORD_PROTECTED",
          sharePassword: hashedPassword,
        },
      });

      const result = await verifySharePassword(
        collection.slug,
        "wrongpassword",
      );
      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "Access denied. You do not have permission to perform this operation.",
      );
    });

    it("PASSWORD_PROTECTED collection cannot be edited by other users", async () => {
      const { owner, other } = await createTestUsers();

      const hashedPassword = await hash("testpassword", 10);
      const collection = await rawPrisma.collection.create({
        data: {
          name: "Protected Collection",
          ownerId: owner.id,
          shareMode: "PASSWORD_PROTECTED",
          sharePassword: hashedPassword,
        },
      });

      // Other user tries to update - should be rejected by policy
      const otherClient = getEnhancedClient(other.id);

      await expect(
        otherClient.collection.update({
          where: { id: collection.id },
          data: { name: "Hacked!" },
        }),
      ).rejects.toThrow();
    });
  });

  describe("Bookmark Access", () => {
    it("bookmarks in LINK_ACCESS collection are readable by others", async () => {
      const { owner, other } = await createTestUsers();

      const collection = await rawPrisma.collection.create({
        data: {
          name: "Shared Bookmarks",
          ownerId: owner.id,
          shareMode: "LINK_ACCESS",
        },
      });

      const bookmark = await rawPrisma.bookmark.create({
        data: {
          title: "Cool Website",
          url: "https://example.com",
          collectionId: collection.id,
        },
      });

      // Other user should see the bookmark
      const otherClient = getEnhancedClient(other.id);

      const result = await otherClient.bookmark.findUnique({
        where: { id: bookmark.id },
      });

      expect(result).not.toBeNull();
      expect(result?.title).toBe("Cool Website");
    });

    it("bookmarks in PRIVATE collection are not accessible to others", async () => {
      const { owner, other } = await createTestUsers();

      const collection = await rawPrisma.collection.create({
        data: {
          name: "Private Bookmarks",
          ownerId: owner.id,
          shareMode: "PRIVATE",
        },
      });

      await rawPrisma.bookmark.create({
        data: {
          title: "Secret Link",
          url: "https://secret.com",
          collectionId: collection.id,
        },
      });

      // Other user should NOT see bookmarks
      const otherClient = getEnhancedClient(other.id);

      const results = await otherClient.bookmark.findMany({
        where: { collectionId: collection.id },
      });

      expect(results).toHaveLength(0);
    });

    it("only collection owner can create bookmarks", async () => {
      const { owner, other } = await createTestUsers();

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
        otherClient.bookmark.create({
          data: {
            title: "Unauthorized Bookmark",
            url: "https://hacker.com",
            collectionId: collection.id,
          },
        }),
      ).rejects.toThrow();
    });

    it("only collection owner can delete bookmarks", async () => {
      const { owner, other } = await createTestUsers();

      const collection = await rawPrisma.collection.create({
        data: {
          name: "Owner Only Deletes",
          ownerId: owner.id,
          shareMode: "LINK_ACCESS",
        },
      });

      const bookmark = await rawPrisma.bookmark.create({
        data: {
          title: "Deletable Only by Owner",
          url: "https://example.com",
          collectionId: collection.id,
        },
      });

      // Other user tries to delete bookmark - should fail
      const otherClient = getEnhancedClient(other.id);

      await expect(
        otherClient.bookmark.delete({
          where: { id: bookmark.id },
        }),
      ).rejects.toThrow();
    });

    it("deleting a collection cascade deletes all its bookmarks", async () => {
      const { owner } = await createTestUsers();

      const collection = await rawPrisma.collection.create({
        data: {
          name: "Collection to Delete",
          ownerId: owner.id,
          shareMode: "LINK_ACCESS",
        },
      });

      // Create multiple bookmarks
      const bookmark1 = await rawPrisma.bookmark.create({
        data: {
          title: "Bookmark A",
          url: "https://a.com",
          collectionId: collection.id,
        },
      });

      const bookmark2 = await rawPrisma.bookmark.create({
        data: {
          title: "Bookmark B",
          url: "https://b.com",
          collectionId: collection.id,
        },
      });

      let bookmarkCount = await rawPrisma.bookmark.count({
        where: { collectionId: collection.id },
      });
      expect(bookmarkCount).toBe(2);

      await rawPrisma.collection.delete({
        where: { id: collection.id },
      });

      const deletedCollection = await rawPrisma.collection.findUnique({
        where: { id: collection.id },
      });
      expect(deletedCollection).toBeNull();

      bookmarkCount = await rawPrisma.bookmark.count({
        where: { collectionId: collection.id },
      });
      expect(bookmarkCount).toBe(0);

      const deletedBookmark1 = await rawPrisma.bookmark.findUnique({
        where: { id: bookmark1.id },
      });
      expect(deletedBookmark1).toBeNull();

      const deletedBookmark2 = await rawPrisma.bookmark.findUnique({
        where: { id: bookmark2.id },
      });
      expect(deletedBookmark2).toBeNull();
    });

    // New Test: We're looking to verify that the function doesn't leak information about existence.
    // See the implementation comments in src/lib/actions/collections.ts for details.

    it("verifySharePassword prevents enumeration attacks with non-existent slugs", async () => {
      // Test with a slug that doesn't exist
      const result = await verifySharePassword(
        "non-existent-slug",
        "anypassword",
      );
      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "Access denied. You do not have permission to perform this operation.",
      );
    });

    it("verifySharePassword prevents enumeration attacks with non-password-protected collections", async () => {
      const { owner } = await createTestUsers();

      // Create a LINK_ACCESS collection
      const collection = await rawPrisma.collection.create({
        data: {
          name: "Link Access Only",
          slug: "link-only-collection",
          ownerId: owner.id,
          shareMode: "LINK_ACCESS",
        },
      });

      // Try to verify password on a non-password collection
      const result = await verifySharePassword(collection.slug, "anypassword");
      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "Access denied. You do not have permission to perform this operation.",
      );
    });
  });
});

// New Test Suite for Bookmark Access in PASSWORD_PROTECTED Collections
/**
 * These tests verify that bookmarks within PASSWORD_PROTECTED collections
 * adhere to the access control policies:
 * - Bookmarks are visible to anonymous users (read access allowed)
 * - Only the collection owner can create bookmarks (write access denied to others)
 * - Only the collection owner can delete bookmarks (delete access denied to others)
 * 
 */
describe("Bookmark Access in PASSWORD_PROTECTED Collections", () => {
  it("bookmarks in PASSWORD_PROTECTED collection are visible to anonymous users", async () => {
    const { owner } = await createTestUsers();

    const hashedPassword = await hash("testpassword", 10);
    const collection = await rawPrisma.collection.create({
      data: {
        name: "Password Protected Bookmarks",
        ownerId: owner.id,
        shareMode: "PASSWORD_PROTECTED",
        sharePassword: hashedPassword,
      },
    });

    const bookmark = await rawPrisma.bookmark.create({
      data: {
        title: "Visible Bookmark",
        url: "https://example.com",
        collectionId: collection.id,
      },
    });

    // Anonymous user should be able to see the bookmark (collection allows read)
    const anonClient = getEnhancedClient(null);
    const result = await anonClient.bookmark.findUnique({
      where: { id: bookmark.id },
    });

    expect(result).not.toBeNull();
    expect(result?.title).toBe("Visible Bookmark");
  });

  it("anonymous users cannot create bookmarks in PASSWORD_PROTECTED collections", async () => {
    const { owner } = await createTestUsers();

    const hashedPassword = await hash("testpassword", 10);
    const collection = await rawPrisma.collection.create({
      data: {
        name: "Protected Creation",
        ownerId: owner.id,
        shareMode: "PASSWORD_PROTECTED",
        sharePassword: hashedPassword,
      },
    });

    // Anonymous user tries to add a bookmark - should fail
    const anonClient = getEnhancedClient(null);

    await expect(
      anonClient.bookmark.create({
        data: {
          title: "Unauthorized Bookmark",
          url: "https://hacker.com",
          collectionId: collection.id,
        },
      }),
    ).rejects.toThrow();
  });
});

/**
 * These tests verify that changing a collection's shareMode
 * updates access permissions as expected. See README.md for explicit requirement.
 */
describe("Collection Share Mode Transitions", () => {
  it("changing PRIVATE collection to LINK_ACCESS grants immediate anonymous access", async () => {
    const { owner } = await createTestUsers();

    // Create PRIVATE collection
    const collection = await rawPrisma.collection.create({
      data: {
        name: "Initially Private",
        ownerId: owner.id,
        shareMode: "PRIVATE",
      },
    });

    // Verify anonymous access is blocked
    const anonClient = getEnhancedClient(null);
    let result = await anonClient.collection.findUnique({
      where: { id: collection.id },
    });
    expect(result).toBeNull();

    // Change to LINK_ACCESS using raw prisma (bypasses policies for admin operation)
    await rawPrisma.collection.update({
      where: { id: collection.id },
      data: { shareMode: "LINK_ACCESS" },
    });

    // Verify anonymous access is now granted
    result = await anonClient.collection.findUnique({
      where: { id: collection.id },
    });
    expect(result).not.toBeNull();
    expect(result?.shareMode).toBe("LINK_ACCESS");
  });

  it("changing PASSWORD_PROTECTED collection to LINK_ACCESS removes password requirement", async () => {
    const { owner } = await createTestUsers();

    const hashedPassword = await hash("testpassword", 10);
    const collection = await rawPrisma.collection.create({
      data: {
        name: "Was Password Protected",
        slug: "transition-test",
        ownerId: owner.id,
        shareMode: "PASSWORD_PROTECTED",
        sharePassword: hashedPassword,
      },
    });

    // Verify password is initially required
    const passwordResult = await verifySharePassword(collection.slug, "wrongpassword");
    expect(passwordResult.success).toBe(false);

    // Change to LINK_ACCESS
    await rawPrisma.collection.update({
      where: { id: collection.id },
      data: { shareMode: "LINK_ACCESS", sharePassword: null },
    });

    // Verify password verification now fails (not a password-protected collection)
    const newPasswordResult = await verifySharePassword(collection.slug, "testpassword");
    expect(newPasswordResult.success).toBe(false);
    expect(newPasswordResult.error).toBe("Access denied. You do not have permission to perform this operation.");

    // And anonymous access is now granted
    const anonClient = getEnhancedClient(null);
    const accessResult = await anonClient.collection.findUnique({
      where: { id: collection.id },
    });
    expect(accessResult).not.toBeNull();
  });
});
