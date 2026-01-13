"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { mockLogin } from "@/lib/actions/auth";
import type { MockUser } from "@/lib/auth-types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, LogIn } from "lucide-react";

// =============================================================================
// Login Card Component
// =============================================================================
// Displays a list of test users that can be clicked to log in.
// Used on the landing page when no user is authenticated.
// =============================================================================

interface LoginCardProps {
  users: MockUser[];
}

export function LoginCard({ users }: LoginCardProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleLogin = (userId: string) => {
    startTransition(async () => {
      await mockLogin(userId);
      router.push("/collections");
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select a User</CardTitle>
        <CardDescription>
          Choose a test user to log in and start using the app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {users.map((user) => (
          <Button
            key={user.id}
            variant="outline"
            className="w-full justify-start h-auto py-3"
            onClick={() => handleLogin(user.id)}
            disabled={isPending}
          >
            <User className="h-5 w-5 mr-3 text-muted-foreground" />
            <div className="flex flex-col items-start">
              <span className="font-medium">{user.name}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
            <LogIn className="h-4 w-4 ml-auto text-muted-foreground" />
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
