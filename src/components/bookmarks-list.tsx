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

import { BookmarkCard } from "@/components/bookmark-card";
import { deleteBookmark } from "@/lib/actions/bookmarks";
import { Bookmark } from "lucide-react";
import { useState } from "react";
import { EditBookmarkDialog } from "./edit-bookmark-dialog";

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

  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingBookmark, setEditingBookmark] = useState<BookmarkData | null>(null);

  const handleEdit = (bookmark: BookmarkData) => {
    // TODO: Open edit dialog or inline edit
    setEditingBookmark(bookmark)
    console.log("Edit bookmark:", bookmark.id);
  };

  const handleDelete = async (bookmark: BookmarkData) => {
    // TODO: Call deleteBookmark action
    if (isDeleting === bookmark.id) return;

    setIsDeleting(bookmark.id);
    await deleteBookmark(bookmark.id);
    setIsDeleting(null);
    console.log("Delete bookmark:", bookmark.id);
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
    <div className="grid gap-4">
      {bookmarks.map((bookmark) => (
        <BookmarkCard
          key={bookmark.id}
          bookmark={bookmark}
          readonly={readonly}
          onEdit={readonly ? undefined : handleEdit}
          onDelete={readonly ? undefined : handleDelete}
          isDeleting={isDeleting == bookmark.id}
        />
      ))}
    
      {editingBookmark && (
        <EditBookmarkDialog
          bookmark={editingBookmark}
          onOpenChange={(open) => {
            if (!open) setEditingBookmark(null);
          }}
        />
      )}
    
    </div>
  );
}
