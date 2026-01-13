import { enhance } from "@zenstackhq/runtime";
import { prisma } from "@/db/prisma";
import { getCurrentUser } from "./auth";

// =============================================================================
// ZenStack Enhanced Prisma Clients
// =============================================================================
// ZenStack's `enhance` function wraps the Prisma client to automatically
// enforce the access policies defined in your schema.zmodel file.
//
// The enhanced client will:
// - Filter query results based on @@allow rules
// - Reject create/update/delete operations that violate policies
// - Automatically scope queries to what the user can access
// =============================================================================

/**
 * Get an enhanced Prisma client for authenticated routes.
 *
 * This client enforces access policies based on the current user.
 * Use this in dashboard routes where a user must be logged in.
 *
 * @example
 * ```ts
 * const db = await getEnhancedPrisma();
 * // Only returns collections the current user can access
 * const collections = await db.collection.findMany();
 * ```
 */
export async function getEnhancedPrisma() {
  const user = await getCurrentUser();
  return enhance(prisma, { user: user ?? undefined });
}

/**
 * Get an enhanced Prisma client for public routes.
 *
 * This client enforces access policies with no authenticated user.
 * Use this in share pages where visitors may not be logged in.
 *
 * @example
 * ```ts
 * const db = await getPublicPrisma();
 * // Only returns collections with shareMode != PRIVATE
 * const collection = await db.collection.findUnique({ where: { slug } });
 * ```
 */
export async function getPublicPrisma() {
  return enhance(prisma, { user: undefined });
}
