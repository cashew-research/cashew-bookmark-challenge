// =============================================================================
// Collections List - CANDIDATE IMPLEMENTS
// =============================================================================
// Displays a grid of collections or an empty state.
//
// TODO:
// - Pass actual collections data from the page
// - The component is ready to render CollectionCards
// =============================================================================

import { CollectionCard } from "@/components/collection-card";
import { FolderOpen } from "lucide-react";

type ShareMode = "PRIVATE" | "LINK_ACCESS" | "PASSWORD_PROTECTED";

interface Collection {
  id: string;
  name: string;
  description?: string | null;
  shareMode: ShareMode;
  _count?: {
    bookmarks: number;
  };
}

interface CollectionsListProps {
  collections: Collection[];
}

export function CollectionsList({ collections }: CollectionsListProps) {
  if (collections.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No collections yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Create your first collection to start organizing your bookmarks.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {collections.map((collection) => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </div>
  );
}
