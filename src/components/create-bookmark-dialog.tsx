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
import { createBookmark } from "@/lib/actions/bookmarks";
import { Plus } from "lucide-react";

interface CreateBookmarkDialogProps {
  collectionId: string;
}

export function CreateBookmarkDialog({ collectionId }: CreateBookmarkDialogProps) {
  return (
    <Dialog>
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
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="My Bookmark" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input id="url" type="url" placeholder="https://example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea id="description" placeholder="What's this bookmark about?" />
          </div>
          <Button type="submit" className="w-full">
            Add Bookmark
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
