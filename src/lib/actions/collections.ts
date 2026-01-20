"use server";

// =============================================================================
// Collection Server Actions - CANDIDATE IMPLEMENTS
// =============================================================================
// These server actions handle CRUD operations for collections.
//
// Requirements:
// - Use Zod for input validation
// - Use getEnhancedPrisma() for database operations (enforces access policies)
// - Handle errors gracefully and return appropriate error messages
// - Use revalidatePath() to refresh the UI after mutations
//
// Hints:
// - The enhanced Prisma client will automatically enforce ownership rules
// - For password-protected collections, hash the password with bcryptjs
// - Return structured results: { success: true, data } or { success: false, error }
// =============================================================================

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { getEnhancedPrisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/db/prisma";
import bcrypt from "bcryptjs";

// -----------------------------------------------------------------------------
// Validation Schemas
// -----------------------------------------------------------------------------

const createCollectionSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
});

const updateCollectionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  shareMode: z.enum(["PRIVATE", "LINK_ACCESS", "PASSWORD_PROTECTED"]).optional(),
  sharePassword: z.string().min(4).max(100).optional().nullable(),
});

// -----------------------------------------------------------------------------
// Server Actions
// -----------------------------------------------------------------------------

/**
 * Create a new collection for the current user.
 *
 * @param data - Collection data (name, description)
 * @returns The created collection or an error
 *
 * TODO: Implement this function
 * - Validate input with Zod
 * - Use getEnhancedPrisma() to create the collection
 * - The enhanced client will automatically set the ownerId
 * - Revalidate the collections page after creation
 */
export async function createCollection(data: {
  name: string;
  description?: string;
}) {
  try {
    // Validate input with Zod
    const validated = createCollectionSchema.parse(data);

    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "You must be logged in to create a collection" };
    }

    // Use enhanced Prisma to create collection
    const db = await getEnhancedPrisma();
    const collection = await db.collection.create({
      data: {
        name: validated.name,
        description: validated.description,
        ownerId: user.id,
      },
    });

    // Revalidate the collections page
    revalidatePath("/collections");

    return { success: true, data: collection };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Validation error" };
    }
    return { success: false, error: "Failed to create collection" };
  }
}

/**
 * Update an existing collection.
 *
 * @param id - Collection ID
 * @param data - Fields to update (name, description, shareMode, sharePassword)
 * @returns The updated collection or an error
 *
 * TODO: Implement this function
 * - Validate input with Zod
 * - If sharePassword is provided, hash it with bcryptjs
 * - Use getEnhancedPrisma() to update (will enforce ownership)
 * - Revalidate the collection detail page
 */
export async function updateCollection(
  id: string,
  data: {
    name?: string;
    description?: string;
    shareMode?: "PRIVATE" | "LINK_ACCESS" | "PASSWORD_PROTECTED";
    sharePassword?: string | null;
  }
) {
  try {
    // Validate input with Zod
    const validated = updateCollectionSchema.parse(data);

    // Get enhanced Prisma to update collection
    const db = await getEnhancedPrisma();

    // Build the update data
    const updateData: {
      name?: string;
      description?: string | null;
      shareMode?: "PRIVATE" | "LINK_ACCESS" | "PASSWORD_PROTECTED";
      sharePassword?: string | null;
    } = {};

    if (validated.name !== undefined) {
      updateData.name = validated.name;
    }

    if (validated.description !== undefined) {
      // Convert empty string to null for database consistency
      updateData.description = validated.description === "" ? null : validated.description;
    }

    if (validated.shareMode !== undefined) {
      updateData.shareMode = validated.shareMode;

      // Clear password when changing away from PASSWORD_PROTECTED
      if (validated.shareMode !== "PASSWORD_PROTECTED") {
        updateData.sharePassword = null;
      }
    }

    // If sharePassword is provided, pass it as plain text (ZenStack @password will hash it)
    if (validated.sharePassword !== undefined && validated.sharePassword !== null) {
      updateData.sharePassword = validated.sharePassword;
    }

    const collection = await db.collection.update({
      where: { id },
      data: updateData,
    });

    // Revalidate the collections pages
    revalidatePath("/collections");
    revalidatePath(`/collections/${id}`);

    return { success: true, data: collection };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Validation error" };
    }
    return { success: false, error: "Failed to update collection" };
  }
}

/**
 * Delete a collection and all its bookmarks.
 *
 * @param id - Collection ID
 * @returns Success or error
 *
 * TODO: Implement this function
 * - Use getEnhancedPrisma() to delete (will enforce ownership)
 * - Bookmarks will be cascade deleted per schema
 * - Revalidate the collections page
 */
export async function deleteCollection(id: string) {
  try {
    // Use enhanced Prisma to delete collection (cascade deletes bookmarks)
    const db = await getEnhancedPrisma();
    await db.collection.delete({
      where: { id },
    });

    // Revalidate the collections page
    revalidatePath("/collections");

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete collection" };
  }
}

/**
 * Verify a share password for a password-protected collection.
 *
 * ⚠️ CODE REVIEW CHALLENGE: This implementation has security issues.
 * Identify and fix them as part of your submission.
 *
 * Security fixes applied:
 * 1. Use bcrypt.compare() for constant-time password comparison (not ===)
 * 2. Use consistent error messages to prevent information leakage
 * 3. Use raw Prisma to access sharePassword (bypasses @omit for server-side verification)
 * 4. Check shareMode === "PASSWORD_PROTECTED" before password check
 * 5. Set secure httpOnly cookie on successful verification
 * 6. Perform hash comparison even for non-existent collections (timing attack prevention)
 *
 * @param slug - Collection slug
 * @param password - Password to verify
 * @returns Whether the password is correct
 */

// Dummy hash for timing attack prevention (pre-computed bcrypt hash)
const DUMMY_HASH = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

export async function verifySharePassword(
  slug: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  // Use raw Prisma to access sharePassword (bypasses @omit for server-side verification)
  const collection = await prisma.collection.findUnique({
    where: { slug },
    select: { sharePassword: true, shareMode: true },
  });

  // Check shareMode first - only allow password verification for PASSWORD_PROTECTED
  if (collection && collection.shareMode !== "PASSWORD_PROTECTED") {
    return { success: false, error: "Access denied" };
  }

  // Use dummy hash if collection doesn't exist or has no password (timing attack prevention)
  const hashToCompare = collection?.sharePassword ?? DUMMY_HASH;

  // Constant-time comparison using bcrypt.compare
  const isValid = await bcrypt.compare(password, hashToCompare);

  // Generic error message for both "not found" and "wrong password" (prevent information leakage)
  if (!collection || !isValid) {
    return { success: false, error: "Access denied" };
  }

  // Set secure cookie on successful verification
  const cookieStore = await cookies();
  cookieStore.set(`share-verified-${slug}`, "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });

  return { success: true };
}
