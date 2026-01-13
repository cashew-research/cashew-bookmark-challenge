// =============================================================================
// Public Share Page - CANDIDATE IMPLEMENTS
// =============================================================================
// This page displays a shared collection to visitors (logged in or not).
//
// Requirements:
// - Fetch the collection by slug using the PUBLIC Prisma client
// - Handle different share modes:
//   - PRIVATE: Show "Collection not found" (shouldn't be accessible)
//   - LINK_ACCESS: Display the collection and bookmarks (read-only)
//   - PASSWORD_PROTECTED: Show password form, verify before displaying
// - Display owner name for attribution
// - Read-only view (no edit capabilities)
//
// Hints:
// - Use getPublicPrisma() instead of getEnhancedPrisma()
// - The access policy should automatically filter out PRIVATE collections
// - For PASSWORD_PROTECTED, use the verifySharePassword server action
// - Store password verification in a cookie or session
// - Use a separate client component for the password form
// =============================================================================

interface SharePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { slug } = await params;

  // TODO: Fetch collection using getPublicPrisma()
  // const db = await getPublicPrisma();
  // const collection = await db.collection.findUnique({
  //   where: { slug },
  //   include: {
  //     owner: { select: { name: true } },
  //     bookmarks: { orderBy: { createdAt: 'desc' } }
  //   }
  // });
  //
  // if (!collection) {
  //   notFound();
  // }
  //
  // // Handle PASSWORD_PROTECTED
  // if (collection.shareMode === 'PASSWORD_PROTECTED') {
  //   // Check if password has been verified (via cookie/session)
  //   // If not, show password form
  // }

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
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Share Page</h1>
            <p className="text-muted-foreground">Slug: {slug}</p>
          </div>

          {/* TODO: Display shared collection */}
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground">
              Implement the public share page here.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Handle: LINK_ACCESS (show content) and PASSWORD_PROTECTED (verify
              first).
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
