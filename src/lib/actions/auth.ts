"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/db/prisma";

// =============================================================================
// Auth Server Actions
// =============================================================================

const MOCK_USER_COOKIE = "mock-user-id";

/**
 * Log in as a specific user by setting the cookie.
 * This is a server action that can be called from client components.
 */
export async function mockLogin(userId: string): Promise<void> {
  const cookieStore = await cookies();

  // Verify user exists before setting cookie
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error(`User with id ${userId} not found`);
  }

  cookieStore.set(MOCK_USER_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

/**
 * Log out by clearing the user cookie.
 * This is a server action that can be called from client components.
 */
export async function mockLogout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(MOCK_USER_COOKIE);
  redirect("/");
}
