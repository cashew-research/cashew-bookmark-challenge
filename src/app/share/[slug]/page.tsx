// =============================================================================
// Public Share Page - CANDIDATE IMPLEMENTS
// =============================================================================
// Display a shared collection to visitors (logged in or not).
//
// Requirements:
// - Fetch collection by slug using getEnhancedPrisma()
// - PRIVATE collections will return null (blocked by policy) → notFound()
// - LINK_ACCESS collections show content directly
// - PASSWORD_PROTECTED collections show <PasswordGate /> first
//   - Check cookie `share-verified-{slug}` to skip gate if already verified
// - Read-only view: display collection info and bookmarks list
// =============================================================================

import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { PasswordGate } from "@/components/password-gate";
import { BookmarksList } from "@/components/bookmarks-list";
import { getEnhancedPrisma } from "@/lib/db";

interface SharePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { slug } = await params;

  // TODO: Fetch collection by slug with owner and bookmarks
  // If null (PRIVATE or not found) → notFound()
  const bookmarks: never[] = []; // Replace with collection.bookmarks

  // TODO: Handle PASSWORD_PROTECTED
  // Check cookie: (await cookies()).get(`share-verified-${slug}`)?.value === 'true'
  // If not verified → return <PasswordGate slug={slug} collectionName={...} />

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-14 items-center">
          <span className="font-semibold">Shared Collection</span>
        </div>
      </header>

      {/* Content */}
      <main className="container py-6">
        <div className="space-y-6">
          {/* TODO: Display collection.name, collection.description, collection.owner.name */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Share Page</h1>
            <p className="text-muted-foreground">Slug: {slug}</p>
          </div>

          {/* TODO: Replace with collection.bookmarks */}
          <BookmarksList bookmarks={bookmarks} readonly />
        </div>
      </main>
    </div>
  );
}
