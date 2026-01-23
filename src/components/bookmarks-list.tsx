// =============================================================================
// Bookmarks List - CANDIDATE IMPLEMENTS
// =============================================================================
// Displays a list of bookmarks or an empty state.
//
// - Wire up onEdit and onDelete callbacks to bookmark actions
// - Handle loading states during delete
// =============================================================================

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { BookmarkCard } from "@/components/bookmark-card";
import { Bookmark } from "lucide-react";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";  
import { deleteBookmark } from "@/lib/actions/bookmarks";
import { EditBookmarkDialog } from "./edit-bookmark-dialog";

interface BookmarkData {
  id: string;
  title: string;
  url: string;
  description?: string | null ;
  createdAt: Date;
}

interface BookmarksListProps {
  bookmarks: BookmarkData[];
  readonly?: boolean;
}

export function BookmarksList({ bookmarks, readonly = false }: BookmarksListProps) {

  // State
  const [bookmarkToDelete, setBookmarkToDelete] = useState<BookmarkData | null>(null);
  const [bookmarkToEdit, setBookmarkToEdit] = useState<BookmarkData | null>(null);

  const handleEdit = (bookmark: BookmarkData) => {
    setBookmarkToEdit(bookmark)
  };

  const handleDelete = (bookmark: BookmarkData) => {
    setBookmarkToDelete(bookmark);
  };

  // We pass the async logic to the dialog
  const executeDelete = async () => {
    if (!bookmarkToDelete) return;
    const result = await deleteBookmark(bookmarkToDelete.id);
    if (result.success) {
      toast.success("Bookmark deleted successfully");
      setBookmarkToDelete(null);
    } else {
      toast.error(`Failed to delete bookmark: ${result.message}`);
      // Keep the dialog open on failure
      throw new Error(result.message);
    }
  };

  if (bookmarks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <Bookmark className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No bookmarks yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Add your first bookmark to this collection.
        </p>
      </div>
    );
  }

  return (
    <>
    <div className="grid gap-4">
      {bookmarks.map((bookmark) => (
        <BookmarkCard
          key={bookmark.id}
          bookmark={bookmark}
          readonly={readonly}
          onEdit={readonly ? undefined : handleEdit}
          onDelete={readonly ? undefined : handleDelete}
        />
      ))}
    </div>
    { /* Rendered once, controlled by state */ }
    <DeleteConfirmDialog
      open={bookmarkToDelete !== null}
      title="Delete Bookmark"
      description="Are you sure you want to delete this bookmark? This action cannot be undone."
      onConfirm={executeDelete}
      onCancel={() => setBookmarkToDelete(null)}
    />
    { bookmarkToEdit && (
      <EditBookmarkDialog
        bookmark={bookmarkToEdit}
        open={!!bookmarkToEdit}
        onOpenChange={(open) => !open && setBookmarkToEdit(null)}
      />
    )}
  </>
  );
}
