import { enhance } from "@zenstackhq/runtime";
import { prisma } from "@/db/prisma";
import { getCurrentUser } from "./auth";

// =============================================================================
// ZenStack Enhanced Prisma Client
// =============================================================================
// ZenStack's `enhance` function wraps the Prisma client to automatically
// enforce the access policies defined in your schema.zmodel file.
//
// The enhanced client will:
// - Filter query results based on @@allow rules
// - Reject create/update/delete operations that violate policies
// - Automatically scope queries to what the user can access
//
// IMPORTANT: Always use getEnhancedPrisma() in your application code.
// This ensures access policies are enforced whether the user is logged in or not.
// =============================================================================

/**
 * Get an enhanced Prisma client that enforces ZenStack access policies.
 *
 * This client automatically uses the current user's context (from cookies)
 * to enforce access policies. If no user is logged in, it enforces policies
 * as an anonymous user.
 *
 * Use this for ALL database operations in your application:
 * - Dashboard routes (user is logged in)
 * - Public share pages (user may or may not be logged in)
 *
 * The access policies in schema.zmodel determine what data is accessible
 * based on the user context.
 *
 * @example
 * ```ts
 * const db = await getEnhancedPrisma();
 *
 * // For logged-in user: returns their collections
 * // For anonymous user: returns only non-PRIVATE collections
 * const collections = await db.collection.findMany();
 * ```
 */
export async function getEnhancedPrisma() {
  const user = await getCurrentUser();
  return enhance(prisma, { user: user ?? undefined });
}
