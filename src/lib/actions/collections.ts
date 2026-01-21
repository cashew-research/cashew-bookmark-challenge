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
import { prisma } from "@/db/prisma";
import { cookies } from "next/headers";


type ActionResult<T = any> =
  | { success: true; data: T }
  | { success: false; error: string };


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
  sharePassword: z.string().min(4).max(100).optional(),
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
}): Promise<ActionResult> {
  try {
    const parsed = createCollectionSchema.parse(data);
    const db = await getEnhancedPrisma();

    const collection = await db.collection.create({
      data: {
        name: parsed.name,
        description: parsed.description,
      },
    });

    revalidatePath("/collections");
    return { success: true, data: collection };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create collection" };
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
    sharePassword?: string;
  }
): Promise<ActionResult> {
  try {
    const parsed = updateCollectionSchema.parse(data);
    const db = await getEnhancedPrisma();
    const updateData = { ...parsed };

    if (parsed.sharePassword) {
      const salt = await bcrypt.genSalt(10);
      updateData.sharePassword = await bcrypt.hash(parsed.sharePassword, salt);
    } else if (parsed.shareMode == "PASSWORD_PROTECTED") {
      return {success: false, error: "Please provide password with length between 4 and 100"}
    }

    const updatedCollection = await db.collection.update({
      where: { id },
      data: updateData,
    });

    const collection = await db.collection.findUnique({
      where: { id },
      select: { sharePassword: true, shareMode: true },
    });

    console.log(collection)


    revalidatePath("/collections");
    revalidatePath(`/collections/${id}`);
    
    return { success: true, data: updatedCollection };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update collection" };
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
export async function deleteCollection(id: string): Promise<ActionResult<null>> {
   try {
    const db = await getEnhancedPrisma();

    await db.collection.delete({
      where: { id },
    });

    revalidatePath("/collections");
    return { success: true, data: null };
  } catch (err: any) {
    return { success: false, error: err.message ?? "Failed to delete collection" };
  }
}

/**
 * Verify a share password for a password-protected collection.
 *
 * ⚠️ CODE REVIEW CHALLENGE: This implementation has security issues.
 * Identify and fix them as part of your submission.
 *
 * @param slug - Collection slug
 * @param password - Password to verify
 * @returns Whether the password is correct
 */
export async function verifySharePassword(
  slug: string,
  password: string
): Promise<{ success: boolean; error?: string }> {

  const collection = await prisma.collection.findUnique({
    where: { slug },
    select: { sharePassword: true, shareMode: true },
  });

  if (!collection || !collection.sharePassword) {
    return {
      success: false,
      error: "Collection not found or password is incorrect",
    };
  }

  const isValid = await bcrypt.compare(
    password,
    collection.sharePassword
  );

  if (!isValid) {
    return {
      success: false,
      error: "Collection not found or password is incorrect",
    };
  }

  (await cookies()).set({
    name: `share-verified-${slug}`,
    value: "true",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: `/share/${slug}`,
    maxAge: 60 * 60,
  });

  return { success: true };
}
