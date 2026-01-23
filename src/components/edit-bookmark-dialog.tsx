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
import { toast } from "sonner";
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
import { Pencil, Loader2 } from "lucide-react";

interface EditBookmarkDialogProps {
  bookmark: {
    id: string;
    title: string;
    url: string;
    description?: string | null;
  };
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EditBookmarkDialog({
  bookmark,
  trigger,
  open,
  onOpenChange,
}: EditBookmarkDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  // Internal state for standalone usage (if not controlled by parent)
  const [internalOpen, setInternalOpen] = useState(false);

  // Determine effective state
  const isControlled = open !== undefined;
  const effectiveOpen = isControlled ? open : internalOpen;
  const setEffectiveOpen = isControlled ? onOpenChange : setInternalOpen;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    const result = await updateBookmark(bookmark.id, {
      title: formData.get("title") as string,
      url: formData.get("url") as string,
      description: (formData.get("description") as string) || undefined,
    });

    if (result.success) {
      toast.success("Bookmark updated");
      setEffectiveOpen?.(false); // Close the dialog
    } else {
      toast.error(result.message || "Failed to update bookmark");
    }
    setIsLoading(false);
  }

  return (
    <Dialog open={effectiveOpen} onOpenChange={setEffectiveOpen}>
      {/* Only render trigger if not controlled */}
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button variant="outline" size="sm">
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </DialogTrigger>
      )}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Bookmark</DialogTitle>
          <DialogDescription>Update your bookmark details.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={bookmark.title}
              placeholder="My Bookmark"
              required
              disabled={isLoading}
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
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={bookmark.description ?? ""}
              placeholder="What's this bookmark about?"
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
