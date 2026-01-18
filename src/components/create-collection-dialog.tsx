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
import { createCollection } from "@/lib/actions/collections";
import { useState } from "react";

export function CreateCollectionDialog() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState<boolean>(false);

  async function handleCollectionCreation(formData: FormData) {
    setError(null);
    setIsPending(true);

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    const result = await createCollection({ name, description });

    if (result.success) {
      setOpen(false); 
    } else {
      setError(result.error);
    }
    setIsPending(false);
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

        <form action={handleCollectionCreation} className="space-y-4">
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              name="name" 
              placeholder="My Collection" 
              required 
            />
          </div>     
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea id="description" name="description" placeholder="What's this collection about?"/>
          </div>      
            
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Creating" : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}