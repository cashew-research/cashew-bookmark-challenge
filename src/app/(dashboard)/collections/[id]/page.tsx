// =============================================================================
// Collection Detail Page - CANDIDATE IMPLEMENTS
// =============================================================================
// This page displays a single collection and its bookmarks.
//
// Requirements:
// - Fetch the collection by ID using the enhanced Prisma client
// - Display collection name, description
// - Show/edit share settings (PRIVATE, LINK_ACCESS, PASSWORD_PROTECTED)
// - Display shareable URL for non-private collections
// - List all bookmarks in the collection
// - CRUD operations for bookmarks (create, edit, delete)
// - Edit/delete the collection itself
//
// Hints:
// - Use Tabs for organizing content (Bookmarks, Settings)
// - Use Dialog for create/edit forms
// - Use the share URL format: /share/[slug]
// - For PASSWORD_PROTECTED, allow setting a password
// - Use server actions from @/lib/actions/collections and @/lib/actions/bookmarks
// =============================================================================

interface CollectionDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CollectionDetailPage({
  params,
}: CollectionDetailPageProps) {
  const { id } = await params;

  // TODO: Fetch collection using getEnhancedPrisma()
  // const db = await getEnhancedPrisma();
  // const collection = await db.collection.findUnique({
  //   where: { id },
  //   include: { bookmarks: { orderBy: { createdAt: 'desc' } } }
  // });
  //
  // if (!collection) {
  //   notFound();
  // }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Collection Detail</h1>
          <p className="text-muted-foreground">Collection ID: {id}</p>
        </div>
        {/* TODO: Add edit/delete buttons */}
      </div>

      {/* TODO: Display collection details and bookmarks */}
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          Implement the collection detail page here.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Include: bookmark list, share settings, and CRUD operations.
        </p>
      </div>
    </div>
  );
}
