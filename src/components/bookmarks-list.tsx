// =============================================================================
// Bookmarks List - CANDIDATE IMPLEMENTS
// =============================================================================
// Displays a list of bookmarks or an empty state.
//
// TODO:
// - Wire up onEdit and onDelete callbacks to bookmark actions
// - Handle loading states during delete
// =============================================================================

"use client";

import { useState } from "react";
import { BookmarkCard } from "@/components/bookmark-card";
import { EditBookmarkDialog } from "@/components/edit-bookmark-dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { deleteBookmark } from "@/lib/actions/bookmarks";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";

interface BookmarkData {
  id: string;
  title: string;
  url: string;
  description?: string | null;
  createdAt: Date;
}

interface BookmarksListProps {
  bookmarks: BookmarkData[];
  readonly?: boolean;
}

export function BookmarksList({ bookmarks, readonly = false }: BookmarksListProps) {
  // Optimistic UI state - track deleted IDs to hide them immediately
  const [optimisticallyDeletedIds, setOptimisticallyDeletedIds] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingBookmark, setEditingBookmark] = useState<BookmarkData | null>(null);
  const [bookmarkToDelete, setBookmarkToDelete] = useState<BookmarkData | null>(null);

  // Filter out optimistically deleted bookmarks for immediate UI feedback
  const visibleBookmarks = bookmarks.filter(b => !optimisticallyDeletedIds.has(b.id));

  const handleDelete = async () => {
    if (!bookmarkToDelete) return;

    const deleteId = bookmarkToDelete.id;
    setBookmarkToDelete(null);
    setDeletingId(deleteId);
    
    // Optimistic update: immediately hide the bookmark
    setOptimisticallyDeletedIds(prev => new Set(prev).add(deleteId));

    try {
      const result = await deleteBookmark(deleteId);

      if (result.success) {
        toast.success("Bookmark deleted");
        // Keep it hidden (server confirmed deletion)
      } else {
        // Revert optimistic update on failure
        setOptimisticallyDeletedIds(prev => {
          const next = new Set(prev);
          next.delete(deleteId);
          return next;
        });
        toast.error(result.error || "Failed to delete bookmark");
      }
    } catch {
      // Revert optimistic update on error
      setOptimisticallyDeletedIds(prev => {
        const next = new Set(prev);
        next.delete(deleteId);
        return next;
      });
      toast.error("An unexpected error occurred");
    } finally {
      setDeletingId(null);
    }
  };

  if (visibleBookmarks.length === 0) {
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
        {visibleBookmarks.map((bookmark) => (
          <div key={bookmark.id} className="relative">
            <BookmarkCard
              bookmark={bookmark}
              readonly={readonly}
              onEdit={readonly ? undefined : () => setEditingBookmark(bookmark)}
              onDelete={readonly ? undefined : () => setBookmarkToDelete(bookmark)}
            />
            {deletingId === bookmark.id && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Deleting...</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      {editingBookmark && (
        <EditBookmarkDialog
          bookmark={editingBookmark}
          onSuccess={() => setEditingBookmark(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {bookmarkToDelete && (
        <DeleteConfirmDialog
          title="Delete Bookmark"
          description={`Are you sure you want to delete "${bookmarkToDelete.title}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setBookmarkToDelete(null)}
          open={true}
        />
      )}
    </>
  );
}
