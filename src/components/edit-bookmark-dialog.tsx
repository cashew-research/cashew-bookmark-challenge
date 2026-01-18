// =============================================================================
// Edit Bookmark Dialog - CANDIDATE IMPLEMENTS
// =============================================================================
// A dialog for editing existing bookmarks. Wire up the form submission.
//
// TODO:
// - Add state for form fields (or use form action)
// - Call updateBookmark action on submit with bookmark id
// - Handle loading/error states
// - Close dialog on success
// =============================================================================

"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateBookmark } from "@/lib/actions/bookmarks";
import { Pencil } from "lucide-react";
import { useState } from "react";

interface EditBookmarkDialogProps {
  bookmark: {
    id: string;
    title: string;
    url: string;
    description?: string | null;
  };
  trigger?: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}

export function EditBookmarkDialog({
  bookmark,
  trigger,
  onOpenChange
}: EditBookmarkDialogProps) {

  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState<boolean>(false);

  async function handleBookmarkEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const url = formData.get("url") as string;
    const description = formData.get("description") as string;

    const result = await updateBookmark(bookmark.id, {
      title,
      url,
      description: description ? description : ''
    });

    if (result.success) {
      onOpenChange?.(false); 
    } else {
      setError(result.error);
    }
    setIsPending(false);
  }

  return (
    <Dialog
      open={!!bookmark}
      onOpenChange={onOpenChange}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Bookmark</DialogTitle>
          <DialogDescription>Update your bookmark details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleBookmarkEdit} className="space-y-4">
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={bookmark.title}
              placeholder="My Bookmark"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              name="url"
              type="url"
              defaultValue={bookmark.url}
              placeholder="https://example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={bookmark.description ?? ""}
              placeholder="What's this bookmark about?"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}