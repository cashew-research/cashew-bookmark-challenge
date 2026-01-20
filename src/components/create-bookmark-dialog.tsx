// =============================================================================
// Create Bookmark Dialog - CANDIDATE IMPLEMENTS
// =============================================================================
// A dialog for adding new bookmarks to a collection. Wire up the form submission.
//
// - Add state for form fields (or use form action)
// - Call createBookmark action on submit with collectionId
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
import { createBookmark } from "@/lib/actions/bookmarks";
import { Plus } from "lucide-react";

interface CreateBookmarkDialogProps {
  collectionId: string;
}

export function CreateBookmarkDialog({ collectionId }: CreateBookmarkDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await createBookmark({
      collectionId,
      title: formData.get("title") as string,
      url: formData.get("url") as string,
      description: (formData.get("description") as string) || undefined,
    });
    if(result.success){
      toast.success("Bookmark added successfully");
      setOpen(false);
    }
    else {
      toast.error(`Failed to add bookmark: ${result.message}`);
    }
    setIsLoading(false);
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
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="My Bookmark" required disabled={isLoading}/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input id="url" name="url" type="url" placeholder="https://example.com" required disabled={isLoading}/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea id="description" name="description" placeholder="What's this bookmark about?" disabled={isLoading} />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Bookmark"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
