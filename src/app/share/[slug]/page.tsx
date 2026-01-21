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

  const db = await getEnhancedPrisma();


  const collection = await db.collection.findUnique({
    where: { 
      slug
    },
    include: {
      bookmarks: true
    }
  });

  if (!collection || collection.shareMode == "PRIVATE") {
    notFound();
  }


  // TODO: Fetch collection by slug with owner and bookmarks
  // If null (PRIVATE or not found) → notFound()
  const bookmarks: never[] = collection.bookmarks // Replace with collection.bookmarks

  // TODO: Handle PASSWORD_PROTECTED
  // Check cookie: (await cookies()).get(`share-verified-${slug}`)?.value === 'true'
  // If not verified → return <PasswordGate slug={slug} collectionName={...} />
  if (collection.shareMode === 'PASSWORD_PROTECTED') {
    const cookieStore = await cookies();
    const isVerified = cookieStore.get(`share-verified-${slug}`)?.value === 'true';

    if (!isVerified) {
      return (
        <PasswordGate 
          slug={slug} 
          collectionName={collection.name} 
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-background px-6">
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
          <div className="space-y-1"> 
            <div className="flex items-baseline gap-4">
              <h1 className="text-3xl font-bold tracking-tight">
                {collection.name}
              </h1>
              
              {collection.description && (
                <p className="text-lg text-muted-foreground">
                  {collection.description}
                </p>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              Collection Owner: <span className="font-medium text-foreground">{collection.ownerId}</span>
            </p>
          </div>
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
