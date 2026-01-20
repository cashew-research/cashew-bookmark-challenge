// =============================================================================
// Create Bookmark Dialog - CANDIDATE IMPLEMENTS
// =============================================================================
// A dialog for adding new bookmarks to a collection. Wire up the form submission.
//
// TODO:
// - Add state for form fields (or use form action)
// - Call createBookmark action on submit with collectionId
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
import { TagInput } from "@/components/tag-input";
import { createBookmark } from "@/lib/actions/bookmarks";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface CreateBookmarkDialogProps {
  collectionId: string;
}

export function CreateBookmarkDialog({ collectionId }: CreateBookmarkDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await createBookmark({
        collectionId,
        title,
        url,
        description: description || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });

      if (result.success) {
        toast.success("Bookmark added successfully");
        setOpen(false);
        // Reset form
        setTitle("");
        setUrl("");
        setDescription("");
        setTags([]);
      } else {
        setError(result.error || "Failed to add bookmark");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Bookmark
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Bookmark</DialogTitle>
          <DialogDescription>
            Add a new bookmark to this collection.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="My Bookmark"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="What's this bookmark about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>Tags (optional)</Label>
            <TagInput
              tags={tags}
              onChange={setTags}
              disabled={isLoading}
              placeholder="e.g. react, tutorial, frontend"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading || !title.trim() || !url.trim()}>
            {isLoading ? "Adding..." : "Add Bookmark"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
