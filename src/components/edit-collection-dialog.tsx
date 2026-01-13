// =============================================================================
// Edit Collection Dialog - CANDIDATE IMPLEMENTS
// =============================================================================
// A dialog for editing existing collections. Wire up the form submission.
//
// TODO:
// - Add state for form fields (or use form action)
// - Call updateCollection action on submit with collection id
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateCollection } from "@/lib/actions/collections";
import { Pencil } from "lucide-react";

type ShareMode = "PRIVATE" | "LINK_ACCESS" | "PASSWORD_PROTECTED";

interface EditCollectionDialogProps {
  collection: {
    id: string;
    name: string;
    description: string | null;
    shareMode: ShareMode;
  };
  trigger?: React.ReactNode;
}

export function EditCollectionDialog({
  collection,
  trigger,
}: EditCollectionDialogProps) {
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
          <DialogTitle>Edit Collection</DialogTitle>
          <DialogDescription>
            Update your collection details and sharing settings.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              defaultValue={collection.name}
              placeholder="My Collection"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              defaultValue={collection.description ?? ""}
              placeholder="What's this collection about?"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shareMode">Share Mode</Label>
            <Select defaultValue={collection.shareMode}>
              <SelectTrigger>
                <SelectValue placeholder="Select share mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRIVATE">Private</SelectItem>
                <SelectItem value="LINK_ACCESS">Link Access</SelectItem>
                <SelectItem value="PASSWORD_PROTECTED">
                  Password Protected
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* TODO: Conditionally show password field when shareMode is PASSWORD_PROTECTED */}
          <div className="space-y-2">
            <Label htmlFor="sharePassword">
              Share Password (for password-protected mode)
            </Label>
            <Input
              id="sharePassword"
              type="password"
              placeholder="Enter password"
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
