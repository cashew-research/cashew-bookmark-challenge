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
      <div className="rounded-xl border-2 border-dashed border-muted-foreground/25 p-12 text-center bg-muted/30">
        <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <FolderOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold">No collections yet</h3>
        <p className="mt-2 text-muted-foreground max-w-sm mx-auto">
          Create your first collection to start organizing your bookmarks. Collections help you group and share related links.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {collections.map((collection, index) => (
        <div
          key={collection.id}
          className="animate-in fade-in slide-in-from-bottom-2"
          style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
        >
          <CollectionCard collection={collection} />
        </div>
      ))}
    </div>
  );
}
