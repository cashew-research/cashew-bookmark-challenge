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
      <div className="rounded-xl border-2 border-dashed border-muted-foreground/25 p-12 text-center bg-muted/30">
        <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Bookmark className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold">No bookmarks yet</h3>
        <p className="mt-2 text-muted-foreground max-w-sm mx-auto">
          {readonly 
            ? "This collection doesn't have any bookmarks yet."
            : "Add your first bookmark to this collection using the button above."
          }
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {visibleBookmarks.map((bookmark, index) => (
          <div 
            key={bookmark.id} 
            className="relative animate-in fade-in slide-in-from-bottom-2"
            style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'backwards' }}
          >
            <BookmarkCard
              bookmark={bookmark}
              readonly={readonly}
              onEdit={readonly ? undefined : () => setEditingBookmark(bookmark)}
              onDelete={readonly ? undefined : () => setBookmarkToDelete(bookmark)}
            />
            {deletingId === bookmark.id && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                  Deleting...
                </div>
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
