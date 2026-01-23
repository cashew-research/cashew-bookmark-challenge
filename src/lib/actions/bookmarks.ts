"use server";

// =============================================================================
// Bookmark Server Actions - CANDIDATE IMPLEMENTS
// =============================================================================
// These server actions handle CRUD operations for bookmarks.
//
// Requirements:
// - Use Zod for input validation
// - Use getEnhancedPrisma() for database operations (enforces access policies)
// - Handle errors gracefully and return appropriate error messages
// - Use revalidatePath() to refresh the UI after mutations
//
// Hints:
// - Bookmarks inherit access from their parent collection
// - The enhanced Prisma client will enforce that only collection owners can create/edit
// - Consider validating URLs (optional bonus)
// =============================================================================

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getEnhancedPrisma } from "@/lib/db";
import { Bookmark, Tag } from "@prisma/client";
import { ActionResult } from "../types";
import { errorResponse, successResponse } from "../utils";


// -----------------------------------------------------------------------------
// Validation Schemas
// -----------------------------------------------------------------------------

const createBookmarkSchema = z.object({
  collectionId: z.string().cuid(),
  title: z.string().min(1, "Title is required").max(200),
  url: z.string().url("Invalid URL"),
  description: z
    .string()
    .max(500)
    .optional()
    .transform((value) => (value === "" ? null : value)),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

const updateBookmarkSchema = createBookmarkSchema
  .omit({ collectionId: true })
  .partial();

// Infer the type from the schema
type CreateBookmarkInput = z.infer<typeof createBookmarkSchema>;
type UpdateBookmarkInput = z.infer<typeof updateBookmarkSchema>;

// -----------------------------------------------------------------------------
// Server Actions
// -----------------------------------------------------------------------------

/**
 * Create a new bookmark in a collection.
 *
 * @param data - Bookmark data (collectionId, title, url, description, tags)
 * @returns The created bookmark or an error
 *
 * - Validate input with Zod
 * - Use getEnhancedPrisma() to create the bookmark
 * - The enhanced client will enforce that user owns the collection
 * - Revalidate the collection detail page
 */
export async function createBookmark(
  data: CreateBookmarkInput,
): Promise<ActionResult<Bookmark & { tags: Tag[] }>> {
  // Validate input
  const parsedData = createBookmarkSchema.safeParse(data);
  if (!parsedData.success) {
    console.log("Validation error:",parsedData.error.flatten().fieldErrors);
    return errorResponse(
      "Validation failed",
      parsedData.error.flatten().fieldErrors,
    );
  }

  const db = await getEnhancedPrisma();
  // Destructure -tags into bookmarkData
  const { tags, ...bookmarkData } = parsedData.data;

  try {
    const newBookmark = await db.bookmark.create({
      data: {
        ...bookmarkData,
        tags:
          tags && tags.length > 0 // transform string[] to nested (transactional) inserts.
            ? {
                create: tags.map((tagName) => ({ name: tagName })),
              }
            : undefined,
      },
      include: {
        tags: true, // include tags in the response
      },
    });

    revalidatePath(`/collections/${bookmarkData.collectionId}`);
    return successResponse(newBookmark, "Bookmark created successfully");
  } catch (error) {
    return errorResponse(
      "Failed to create bookmark. Ensure you own the collection.",
      {
        general: [(error as Error).message],
      },
    );
  }
}

/**
 * Update an existing bookmark.
 *
 * @param id - Bookmark ID
 * @param data - Fields to update (title, url, description, tags)
 * @returns The updated bookmark or an error
 *
 * - Validate input with Zod
 * - Use getEnhancedPrisma() to update (will enforce collection ownership)
 * - Revalidate the collection detail page
 */
export async function updateBookmark(
  id: string,
  data: UpdateBookmarkInput,
): Promise<ActionResult<Bookmark & { tags: Tag[] }>> {
  // Validate input.
  const parsedData = updateBookmarkSchema.safeParse(data);
  if (!parsedData.success) {
    return errorResponse(
      "Validation failed",
      parsedData.error.flatten().fieldErrors,
    );
  }

  const db = await getEnhancedPrisma();
  try {
    // Destructure -tags into bookmarkData
    const { tags, ...bookmarkData } = parsedData.data;

    const updatedBookmark = await db.bookmark.update({
      where: { id },
      data: {
        ...bookmarkData,
        ...(tags
          ? {
              // Handle tags update: delete existing and create new ones
              tags: {
                deleteMany: {},
                create: tags.map((tagName) => ({ name: tagName })),
              },
            }
          : {}),
      },
      include: {
        tags: true, // include tags in the response
        collection: { select: { id: true } },
      },
    });

    if (updatedBookmark.collection) {
      revalidatePath(`/collections/${updatedBookmark.collection.id}`);
    }

    return successResponse(updatedBookmark, "Bookmark updated successfully");
  } catch (error) {
    return errorResponse(
      "Failed to update bookmark. Ensure you own the collection.",
      {
        general: [(error as Error).message],
      },
    );
  }
}

/**
 * Delete a bookmark.
 *
 * @param id - Bookmark ID
 * @returns Success or error
 *
 * - Use getEnhancedPrisma() to delete (will enforce collection ownership)
 * - Revalidate the collection detail page
 */
export async function deleteBookmark(id: string) {
  // Validate the input
  if (!id) {
    return errorResponse("Bookmark ID is required for deletion");
  }

  try {
    const db = await getEnhancedPrisma();
    const deletedBookmark = await db.bookmark.delete({ where: { id } });
    // Revalidate all collection pages (could optimize if we fetched the collectionId first)
    revalidatePath(`/collections/${deletedBookmark.collectionId}`);
    return successResponse(null, "Bookmark deleted successfully");
  } catch (error) {
    return errorResponse(
      "Failed to delete bookmark.",
      {
        general: [(error as Error).message],
      }
    );
  }
}
