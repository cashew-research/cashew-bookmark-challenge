import { redirect } from "next/navigation";
import { getCurrentUser, getAvailableUsers } from "@/lib/auth";
import { mockLogout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserSwitcher } from "@/components/user-switcher";
import { Bookmark, LogOut, User } from "lucide-react";
import Link from "next/link";

// =============================================================================
// Dashboard Layout - Auth Protected
// =============================================================================
// This layout wraps all authenticated routes. It:
// 1. Redirects to login if not authenticated
// 2. Provides a navigation bar with user info
// 3. Includes a user switcher for testing with different accounts
// =============================================================================

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/");
  }

  const allUsers = await getAvailableUsers();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-2">
        <div className="container flex h-14 items-center">
          {/* Logo / Brand */}
          <Link href="/collections" className="flex items-center gap-2 mr-6">
            <Bookmark className="h-5 w-5" />
            <span className="font-semibold">Bookmarks</span>
          </Link>

          {/* Nav Links */}
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/collections"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              My Collections
            </Link>
          </nav>

          {/* User Menu (right side) */}
          <div className="ml-auto flex items-center gap-4">
            {/* User Switcher (for testing) */}
            <UserSwitcher currentUser={user} allUsers={allUsers} />

            {/* Current User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <form action={mockLogout}>
                  <DropdownMenuItem asChild>
                    <button type="submit" className="w-full cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </button>
                  </DropdownMenuItem>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container p-4">{children}</main>
    </div>
  );
}
