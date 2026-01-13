"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { mockLogin } from "@/lib/actions/auth";
import type { MockUser } from "@/lib/auth-types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RefreshCw, Users } from "lucide-react";
import { cn } from "@/lib/utils";

// =============================================================================
// User Switcher Component
// =============================================================================
// This component allows switching between test users during development.
// In a real application, you would not have this - users would need to
// log out and log in again to switch accounts.
//
// This is provided to make testing easier:
// - Test access control by switching to a different user
// - Verify that User A can't see User B's private collections
// - Check that shared collections are visible to other users
// =============================================================================

interface UserSwitcherProps {
  currentUser: MockUser;
  allUsers: MockUser[];
}

export function UserSwitcher({ currentUser, allUsers }: UserSwitcherProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSwitch = (userId: string) => {
    startTransition(async () => {
      await mockLogin(userId);
      router.refresh();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Switch User</span>
          {isPending && <RefreshCw className="h-3 w-3 animate-spin" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Switch to test user
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {allUsers.map((user) => (
          <DropdownMenuItem
            key={user.id}
            onClick={() => handleSwitch(user.id)}
            disabled={isPending || user.id === currentUser.id}
            className={cn(
              "cursor-pointer",
              user.id === currentUser.id && "bg-accent"
            )}
          >
            <div className="flex flex-col">
              <span className="font-medium">{user.name}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
            {user.id === currentUser.id && (
              <span className="ml-auto text-xs text-muted-foreground">
                (current)
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
