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

import { useState } from "react";
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
import { toast } from "sonner";

interface EditBookmarkDialogProps {
  bookmark: {
    id: string;
    title: string;
    url: string;
    description: string | null;
  };
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function EditBookmarkDialog({
  bookmark,
  trigger,
  onSuccess,
}: EditBookmarkDialogProps) {
  const [open, setOpen] = useState(true); // Start open when rendered
  const [title, setTitle] = useState(bookmark.title);
  const [url, setUrl] = useState(bookmark.url);
  const [description, setDescription] = useState(bookmark.description ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle close - call onSuccess to unmount this component
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      onSuccess?.();
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await updateBookmark(bookmark.id, {
        title,
        url,
        description: description || undefined,
      });

      if (result.success) {
        toast.success("Bookmark updated successfully");
        setOpen(false);
        onSuccess?.();
      } else {
        setError(result.error || "Failed to update bookmark");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Bookmark</DialogTitle>
          <DialogDescription>Update your bookmark details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Bookmark"
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this bookmark about?"
              disabled={isLoading}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading || !title.trim() || !url.trim()}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
