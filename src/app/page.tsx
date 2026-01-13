import { redirect } from "next/navigation";
import { getCurrentUser, getAvailableUsers } from "@/lib/auth";
import { LoginCard } from "@/components/login-card";
import { Bookmark } from "lucide-react";

// =============================================================================
// Landing Page
// =============================================================================
// This page serves as the entry point for the application:
// - If logged in: redirects to the collections page
// - If not logged in: shows a user picker for mock authentication
// =============================================================================

export default async function HomePage() {
  const user = await getCurrentUser();

  // If already logged in, redirect to collections
  if (user) {
    redirect("/collections");
  }

  const availableUsers = await getAvailableUsers();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Bookmark className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Bookmarks</h1>
          <p className="text-muted-foreground">
            Organize and share your bookmarks with ease
          </p>
        </div>

        {/* Login Card */}
        <LoginCard users={availableUsers} />

        {/* Info */}
        <p className="text-center text-xs text-muted-foreground">
          This is a mock authentication system for the take-home challenge.
          <br />
          Select a user above to log in.
        </p>
      </div>
    </div>
  );
}
