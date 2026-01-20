"use server";

// =============================================================================
// Bookmark Server Actions
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

// -----------------------------------------------------------------------------
// Validation Schemas
// -----------------------------------------------------------------------------

const createBookmarkSchema = z.object({
  collectionId: z.string().min(1, "Collection ID is required"),
  title: z.string().min(1, "Title is required").max(200),
  url: z.string().url("Invalid URL"),
  description: z.string().max(500).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

const updateBookmarkSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  url: z.string().url().optional(),
  description: z.string().max(500).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

// -----------------------------------------------------------------------------
// Server Actions
// -----------------------------------------------------------------------------

/**
 * Create a new bookmark in a collection.
 *
 * @param data - Bookmark data (collectionId, title, url, description, tags)
 * @returns The created bookmark or an error
 *
 * Creates a new bookmark in a collection.
 */
export async function createBookmark(data: {
  collectionId: string;
  title: string;
  url: string;
  description?: string;
  tags?: string[];
}) {
  try {
    // Validate input with Zod (includes URL validation)
    const validated = createBookmarkSchema.parse(data);

    // Use enhanced Prisma to create bookmark (enforces collection ownership)
    const db = await getEnhancedPrisma();
    const bookmark = await db.bookmark.create({
      data: {
        title: validated.title,
        url: validated.url,
        description: validated.description,
        collectionId: validated.collectionId,
        // Store tags as JSON string (SQLite doesn't support arrays)
        tags: JSON.stringify(validated.tags ?? []),
      },
    });

    // Revalidate the collection detail page
    revalidatePath(`/collections/${validated.collectionId}`);

    return { success: true, data: bookmark };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Validation error" };
    }
    return { success: false, error: "Failed to create bookmark" };
  }
}

/**
 * Update an existing bookmark.
 *
 * @param id - Bookmark ID
 * @param data - Fields to update (title, url, description, tags)
 * @returns The updated bookmark or an error
 *
 * Updates an existing bookmark.
 */
export async function updateBookmark(
  id: string,
  data: {
    title?: string;
    url?: string;
    description?: string;
    tags?: string[];
  }
) {
  try {
    // Validate input with Zod
    const validated = updateBookmarkSchema.parse(data);

    // Use enhanced Prisma to update bookmark (enforces collection ownership)
    const db = await getEnhancedPrisma();

    // Build the update data - only include fields that are provided
    const updateData: {
      title?: string;
      url?: string;
      description?: string | null;
      tags?: string;
    } = {};

    if (validated.title !== undefined) {
      updateData.title = validated.title;
    }

    if (validated.url !== undefined) {
      updateData.url = validated.url;
    }

    if (validated.description !== undefined) {
      // Convert empty string to null for database consistency
      updateData.description = validated.description === "" ? null : validated.description;
    }

    if (validated.tags !== undefined) {
      // Store tags as JSON string (SQLite doesn't support arrays)
      updateData.tags = JSON.stringify(validated.tags);
    }

    const bookmark = await db.bookmark.update({
      where: { id },
      data: updateData,
      include: { collection: { select: { id: true } } },
    });

    // Revalidate the collection detail page
    revalidatePath(`/collections/${bookmark.collection.id}`);

    return { success: true, data: bookmark };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Validation error" };
    }
    return { success: false, error: "Failed to update bookmark" };
  }
}

/**
 * Delete a bookmark.
 *
 * @param id - Bookmark ID
 * @returns Success or error
 *
 * Deletes a bookmark.
 */
export async function deleteBookmark(id: string) {
  try {
    // Use enhanced Prisma to delete bookmark (enforces collection ownership)
    const db = await getEnhancedPrisma();

    // First get the bookmark to know which collection to revalidate
    const bookmark = await db.bookmark.findUnique({
      where: { id },
      select: { collectionId: true },
    });

    if (!bookmark) {
      return { success: false, error: "Bookmark not found" };
    }

    await db.bookmark.delete({
      where: { id },
    });

    // Revalidate the collection detail page
    revalidatePath(`/collections/${bookmark.collectionId}`);

    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete bookmark" };
  }
}
