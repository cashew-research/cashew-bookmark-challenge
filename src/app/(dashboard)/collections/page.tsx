// =============================================================================
// Collections Page - CANDIDATE IMPLEMENTS
// =============================================================================
// Display all collections owned by the current user. Allow creating new ones.
//
// Requirements:
// - Fetch collections with getEnhancedPrisma() (auto-filters to current user)
// - Pass collections to CollectionsList component
// =============================================================================

import { CollectionsList } from "@/components/collections-list";
import { CreateCollectionDialog } from "@/components/create-collection-dialog";
import { getEnhancedPrisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CollectionsPage() {
  // Get current user to filter owned collections only
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  // TODO: Fetch collections with getEnhancedPrisma()
  // Include bookmark count: include: { _count: { select: { bookmarks: true } } }
  // Filter to only show collections owned by the current user (not shared ones)
  const db = await getEnhancedPrisma();
  const collections = await db.collection.findMany({
    where: {
      ownerId: user.id,
    },
    include: {
      _count: {
        select: { bookmarks: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Collections</h1>
          <p className="text-muted-foreground">
            Organize your bookmarks into collections
          </p>
        </div>

        <CreateCollectionDialog />
      </div>

      {/* TODO: Replace empty array with fetched collections */}
      <CollectionsList collections={collections} />
    </div>
  );
}
