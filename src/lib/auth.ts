import { cookies } from "next/headers";
import { prisma } from "@/db/prisma";
import type { MockUser } from "./auth-types";

// =============================================================================
// Mock Authentication System (Server-Only)
// =============================================================================
// This module contains server-only functions that use next/headers.
// Do NOT import this file into client components.
//
// For server actions (mockLogin, mockLogout), import from:
//   import { mockLogin, mockLogout } from "@/lib/actions/auth"
//
// For the MockUser type, import from:
//   import type { MockUser } from "@/lib/auth-types"
// =============================================================================

const MOCK_USER_COOKIE = "mock-user-id";

// Re-export the type for convenience in server components
export type { MockUser } from "./auth-types";

/**
 * Get the currently authenticated user from the cookie.
 * Returns null if no user is logged in.
 *
 * NOTE: This is a server-only function. Do not call from client components.
 */
export async function getCurrentUser(): Promise<MockUser | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(MOCK_USER_COOKIE)?.value;

  if (!userId) {
    return null;
  }

  // Fetch user from database to ensure they exist
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  return user;
}

/**
 * Get all users available for the mock login picker.
 * Used in the landing page to show login options.
 *
 * NOTE: This is a server-only function. Do not call from client components.
 */
export async function getAvailableUsers(): Promise<MockUser[]> {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return users;
}
