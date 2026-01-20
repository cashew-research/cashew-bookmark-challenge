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
import { ShareMode, Collection } from "@prisma/client";
import { getCurrentUser } from "../auth";
import { ActionResult } from "../types";
import { errorResponse, successResponse } from "../utils";
import { error } from "console";
import { compare } from "bcryptjs";

// -----------------------------------------------------------------------------
// Validation Schemas
// -----------------------------------------------------------------------------

const createCollectionSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100),
    description: z.string().max(500).optional(),
    slug: z.string().min(1).max(100).optional(),
    shareMode: z
      .enum(["PRIVATE", "LINK_ACCESS", "PASSWORD_PROTECTED"])
      .optional()
      .default("PRIVATE"),
    // Allow empty string to be transformed to null
    sharePassword: z
      .string()
      .min(4)
      .max(100)
      .optional()
      .nullable()
      .transform((value) => (value === "" ? null : value)),
  })
  .refine(
    (data) => {
      // If mode is PASSWORD_PROTECTED, password is REQUIRED
      if (data.shareMode === ShareMode.PASSWORD_PROTECTED) {
        return !!data.sharePassword && data.sharePassword.length >= 4;
      }
      return true;
    },
    {
      message: "Password is required when Share Mode is Password Protected",
      path: ["sharePassword"], // Shows the error on the password field
    },
  );

const updateCollectionSchema = createCollectionSchema
  .omit({ slug: true })
  .partial();

// Infer the type from the schema
type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;

// Generic access denied error message
const ACCESS_DENIED_ERROR = "Access denied. You do not have permission to perform this operation.";


// -----------------------------------------------------------------------------
// Server Actions
// -----------------------------------------------------------------------------

/**
 * Create a new collection for the current user.
 *
 * @param data - Collection data (name, description)
 * @returns The created collection or an error
 *
 * - Validate input with Zod
 * - Use getEnhancedPrisma() to create the collection
 * - The enhanced client will automatically set the ownerId
 * - Revalidate the collections page after creation
 */
export async function createCollection(
  data: CreateCollectionInput,
): Promise<ActionResult<Collection>> {
  // Validate input. We use safeParse to handle validation errors gracefully.
  const parsedData = createCollectionSchema.safeParse(data);
  if (!parsedData.success) {
    return errorResponse(
      "Validation failed",
      parsedData.error.flatten().fieldErrors,
    );
  }

  try {
    const db = await getEnhancedPrisma();
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse("User must be logged in to create a collection");
    }

    // Create the collection, password is hashed due to the @password directive in the schema
    const collection = await db.collection.create({
      data: {
        ...parsedData.data,
        ownerId: user.id,
      },
    });
    revalidatePath("/collections");

    return successResponse(collection, "Collection created successfully");
  } catch (error) {
    return errorResponse("Database error during collection creation");
  }
}

/**
 * Update an existing collection.
 *
 * @param id - Collection ID
 * @param data - Fields to update (name, description, shareMode, sharePassword)
 * @returns The updated collection or an error
 *
 * - Validate input with Zod
 * - If sharePassword is provided, hash it with bcryptjs
 * - Use getEnhancedPrisma() to update (will enforce ownership)
 * - Revalidate the collection detail page
 */
export async function updateCollection(
  id: string,
  data: UpdateCollectionInput,
): Promise<ActionResult<Collection>> {
  // Validate input.
  const parsedData = updateCollectionSchema.safeParse(data);
  if (!parsedData.success) {
    return errorResponse(
      "Validation failed",
      parsedData.error.flatten().fieldErrors,
    );
  }

  try {
    const db = await getEnhancedPrisma();
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse("User must be logged in to update a collection");
    }
    const collection = await db.collection.update({
      where: { id },
      data: parsedData.data,
    });
    revalidatePath("/collections");
    revalidatePath(`/collections/${collection.id}`);
    revalidatePath(`/share/${collection.slug}`);
    return successResponse(collection, "Collection updated successfully");
  } catch (error) {
    return errorResponse("Database error during collection update");
  }
}

/**
 * Delete a collection and all its bookmarks.
 *
 * @param id - Collection ID
 * @returns Success or error
 *
 * - Use getEnhancedPrisma() to delete (will enforce ownership)
 * - Bookmarks will be cascade deleted per schema
 * - Revalidate the collections page
 */
export async function deleteCollection(id: string) {
  // Validate input
  if (!id) {
    return errorResponse("Collection ID is required for deletion");
  }

  try {
    const db = await getEnhancedPrisma();
    // Being extra defensive here, although getEnhancedPrisma enforces ownership
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse("User must be logged in to delete a collection");
    }
    // Throws a 'RecordNotFound' error if the collection does not exist or does not belong to the user
    await db.collection.delete({
      where: { id },
    });
    revalidatePath("/collections");
    return successResponse(undefined, "Collection deleted successfully");
  } catch (error) {
    return errorResponse("Database error during collection deletion");
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
  password: string,
): Promise<{ success: boolean; error?: string }> {
  const db = await getEnhancedPrisma();

  // Explicitly request sharePassword due to @omit
  const collection = await db.collection.findUnique({
    where: { slug },
    select: { sharePassword: true, shareMode: true },
  });
  // 1. Password verification only needs to occur for PASSWORD_PROTECTED collections and
  // we want to prevent enumeration so we return a generic access denied message.
  //
  if (!collection || collection.shareMode !== ShareMode.PASSWORD_PROTECTED) {
    // Mitigate timing attacks by adding a fake delay w/ some jitter
    // another option would be to always hash a dummy password
    // to ensure consistent timing.
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100));
    return {
      success: false,
      error:
        ACCESS_DENIED_ERROR,
    };
  }

  // 2. If no sharePassword is set, deny access.
  if (!collection.sharePassword) {
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100));
    return {
      success: false,
      error:
        ACCESS_DENIED_ERROR,
    };
  }

  // 3. Verification was broken. It was using plain equality instead of bcryptjs compare function.
  const isPasswordValid = await compare(password, collection.sharePassword);
  if (isPasswordValid) {
    return { success: true };
  } else {
    return {
      success: false,
      error:
        ACCESS_DENIED_ERROR,
    };
  }
}
