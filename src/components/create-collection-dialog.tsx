// =============================================================================
// Create Collection Dialog - CANDIDATE IMPLEMENTS
// =============================================================================
// A dialog for creating new collections. Wire up the form submission.
//
// TODO:
// - Add state for form fields (or use form action)
// - Call createCollection action on submit
// - Handle loading/error states
// - Close dialog on success
// =============================================================================

"use client";

import { use, useState } from "react";
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
import { toast } from "sonner";
import { createCollection } from "@/lib/actions/collections";

export function CreateCollectionDialog() {
  // Modal visibility state
  const [open, setOpen] = useState(false);
  // Button spinner state
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const result = await createCollection({
      name,
      description: description || undefined,
    });

    if (result.success) {
      toast.success("Collection created successfully");
      setOpen(false);
    } else {
      toast.error(`Failed to create collection: ${result.message}`);
    }
    setIsLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Collection</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Collection</DialogTitle>
          <DialogDescription>
            Create a new collection to organize your bookmarks.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required disabled={isLoading} placeholder="My Collection" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="What's this collection about?"
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
