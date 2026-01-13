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
import { z } from "zod";
import { getEnhancedPrisma } from "@/lib/db";
import bcrypt from "bcryptjs";

// -----------------------------------------------------------------------------
// Validation Schemas
// -----------------------------------------------------------------------------

// const createCollectionSchema = z.object({
//   name: z.string().min(1, "Name is required").max(100),
//   description: z.string().max(500).optional(),
// });

// const updateCollectionSchema = z.object({
//   name: z.string().min(1).max(100).optional(),
//   description: z.string().max(500).optional(),
//   shareMode: z.enum(["PRIVATE", "LINK_ACCESS", "PASSWORD_PROTECTED"]).optional(),
//   sharePassword: z.string().min(4).max(100).optional(),
// });

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
  // TODO: Implement
  console.log("createCollection called with:", data);
  throw new Error("Not implemented");
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
    sharePassword?: string;
  }
) {
  // TODO: Implement
  console.log("updateCollection called with:", id, data);
  throw new Error("Not implemented");
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
  // TODO: Implement
  console.log("deleteCollection called with:", id);
  throw new Error("Not implemented");
}

/**
 * Verify a share password for a password-protected collection.
 *
 * @param slug - Collection slug
 * @param password - Password to verify
 * @returns Whether the password is correct
 *
 * TODO: Implement this function
 * - Fetch the collection by slug (use raw prisma, not enhanced, to access password)
 * - Compare the provided password with the hashed password using bcrypt
 * - Do NOT expose whether the collection exists (return same error for both)
 * - Consider setting a cookie to remember verification
 */
export async function verifySharePassword(
  slug: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  // TODO: Implement
  console.log("verifySharePassword called with:", slug);
  throw new Error("Not implemented");
}
