// =============================================================================
// Collection Detail Page - CANDIDATE IMPLEMENTS
// =============================================================================
// Display a single collection with its bookmarks and settings.
//
// Requirements:
// - Fetch collection by ID with bookmarks using getEnhancedPrisma()
// - Bookmarks tab: list bookmarks with add/edit/delete functionality
// - Settings tab: edit collection details and share settings
// =============================================================================

import { notFound } from "next/navigation";
import Link from "next/link";
import { BookmarksList } from "@/components/bookmarks-list";
import { CreateBookmarkDialog } from "@/components/create-bookmark-dialog";
import { CollectionSettingsForm } from "@/components/collection-settings-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEnhancedPrisma } from "@/lib/db";

interface CollectionDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CollectionDetailPage({
  params,
}: CollectionDetailPageProps) {
  const { id } = await params;

  // TODO: Fetch collection with bookmarks using getEnhancedPrisma()
  // If not found, call notFound()
  const bookmarks: never[] = []; // Replace with collection.bookmarks

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          {/* TODO: Display collection.name and collection.description */}
          <h1 className="text-3xl font-bold tracking-tight">Collection Detail</h1>
          <p className="text-muted-foreground">Collection ID: {id}</p>
        </div>

        <Link href="/collections" className="text-sm text-muted-foreground hover:underline">
          ← Back to Collections
        </Link>
      </div>

      <Tabs defaultValue="bookmarks">
        <TabsList>
          <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="bookmarks" className="space-y-4">
          <div className="flex justify-end">
            <CreateBookmarkDialog collectionId={id} />
          </div>

          {/* TODO: Replace with collection.bookmarks */}
          <BookmarksList bookmarks={bookmarks} />
        </TabsContent>

        <TabsContent value="settings">
          {/* TODO: Pass fetched collection to CollectionSettingsForm
           * <CollectionSettingsForm collection={collection} />
           */}
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground">
              Pass the fetched collection to CollectionSettingsForm.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
