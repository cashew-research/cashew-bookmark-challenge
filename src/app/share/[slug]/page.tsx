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
  // Fetch collection by slug, returns NULL if user is not allowed to see it
  const collection = await db.collection.findUnique({
    where: { slug },
    include: {
      bookmarks: {
        orderBy: { createdAt: "desc" },
        include: {
          tags: true,
        },
      },
      owner: {
        select: { name: true },
      },
    },
  });

  if (!collection) {
    return notFound();
  }

  const bookmarks = collection?.bookmarks || [];

  // Check cookie: (await cookies()).get(`share-verified-${slug}`)?.value === 'true'
  // If not verified → return <PasswordGate slug={slug} collectionName={...} />
  // 3. Handle Password Protection
  if (collection.shareMode === "PASSWORD_PROTECTED") {
    const cookieStore = await cookies();
    const verifiedCookie = cookieStore.get(`share-verified-${slug}`);
    
    // If cookie is missing or not "true", stop here and show the Gate
    if (verifiedCookie?.value !== "true") {
      return <PasswordGate slug={slug} collectionName={collection.name} />;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
             <span>Shared Collection</span>
             <span className="text-muted-foreground">/</span>
             <span>{collection.owner.name}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container py-6">
        <div className="space-y-6">
          {/* Collection Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {collection.name}
            </h1>
            {collection.description && (
              <p className="text-lg text-muted-foreground">
                {collection.description}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Shared by {collection.owner.name}
            </p>
          </div>
          <BookmarksList bookmarks={bookmarks} readonly />
        </div>
      </main>
    </div>
  );
}
