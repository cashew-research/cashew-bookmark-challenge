"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifySharePassword } from "@/lib/actions/collections";
import { LockKeyhole } from "lucide-react";

interface PasswordGateProps {
  slug: string;
  collectionName: string;
}

export function PasswordGate({ slug, collectionName }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await verifySharePassword(slug, password);

      if (result.success) {
        // Cookie is set by server action, reload page to show content
        window.location.reload();
      } else {
        setError(result.error || "Incorrect password");
        setIsLoading(false);
      }
    } catch {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <LockKeyhole className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle>Password Required</CardTitle>
          <CardDescription>
            Enter the password to view &ldquo;{collectionName}&rdquo;
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={isLoading}
                autoFocus
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !password}
            >
              {isLoading ? "Verifying..." : "Unlock Collection"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
