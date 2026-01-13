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

interface EditBookmarkDialogProps {
  bookmark: {
    id: string;
    title: string;
    url: string;
    description: string | null;
  };
  trigger?: React.ReactNode;
}

export function EditBookmarkDialog({
  bookmark,
  trigger,
}: EditBookmarkDialogProps) {
  return (
    <Dialog>
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
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              defaultValue={bookmark.title}
              placeholder="My Bookmark"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              defaultValue={bookmark.url}
              placeholder="https://example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              defaultValue={bookmark.description ?? ""}
              placeholder="What's this bookmark about?"
            />
          </div>
          <Button type="submit" className="w-full">
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
