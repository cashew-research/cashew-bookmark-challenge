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
import { useState } from "react";

interface CreateBookmarkDialogProps {
  collectionId: string;
}

export function CreateBookmarkDialog({ collectionId }: CreateBookmarkDialogProps) {

  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleBookmarkCreation(formData: FormData) {
    setIsPending(true);
    setError(null);

    const data =  {
      collectionId: formData.get("collectionId") as string,
      title: formData.get("title") as string,
      url: formData.get("url") as string,
      description: (formData.get("description") as string) || undefined,
    };
    const result = await createBookmark(data);

    if (result.success) {
      setOpen(false);
    } else {
      setError(JSON.parse(result.error)[0]?.message || "Something went wrong");
    }

    setIsPending(false);
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

        <form action={handleBookmarkCreation} className="space-y-4">
          {error && <p className="text-sm font-medium text-red-500">{error}</p>}

          <input type="hidden" name="collectionId" value={collectionId} />

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="My Bookmark" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input 
              id="url" 
              name="url" 
              type="url" 
              placeholder="https://example.com" 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea 
              id="description" 
              name="description" 
              placeholder="What's this bookmark about?" 
            />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Adding..." : "Add Bookmark"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
