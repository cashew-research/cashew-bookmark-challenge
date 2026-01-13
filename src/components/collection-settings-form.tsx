// =============================================================================
// Collection Settings Form - CANDIDATE IMPLEMENTS
// =============================================================================
// Form for editing collection settings including share mode and password.
//
// TODO:
// - Add state for form fields
// - Call updateCollection action on save
// - Show password field only when shareMode is PASSWORD_PROTECTED
// - Show shareable URL only when shareMode is not PRIVATE
// - Handle loading/error states
// =============================================================================

"use client";

import { useState } from "react";
import { ShareModeSelect } from "@/components/share-mode-select";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateCollection, deleteCollection } from "@/lib/actions/collections";
import { Copy } from "lucide-react";

type ShareMode = "PRIVATE" | "LINK_ACCESS" | "PASSWORD_PROTECTED";

interface Collection {
  id: string;
  name: string;
  description?: string | null;
  slug: string;
  shareMode: ShareMode;
}

interface CollectionSettingsFormProps {
  collection: Collection;
}

export function CollectionSettingsForm({ collection }: CollectionSettingsFormProps) {
  const [shareMode, setShareMode] = useState<ShareMode>(collection.shareMode);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/share/${collection.slug}`
    : `/share/${collection.slug}`;

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Collection Details</CardTitle>
          <CardDescription>Update your collection name and description.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue={collection.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                defaultValue={collection.description ?? ""}
                placeholder="What's this collection about?"
              />
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>

      {/* Share Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Share Settings</CardTitle>
          <CardDescription>Control who can access this collection.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Share Mode</Label>
            <ShareModeSelect value={shareMode} onChange={setShareMode} />
          </div>

          {/* TODO: Show password field when PASSWORD_PROTECTED */}
          {shareMode === "PASSWORD_PROTECTED" && (
            <div className="space-y-2">
              <Label htmlFor="password">Share Password</Label>
              <Input id="password" type="password" placeholder="Enter a password" />
              <p className="text-xs text-muted-foreground">
                Visitors will need this password to view the collection.
              </p>
            </div>
          )}

          {/* TODO: Show shareable URL when not PRIVATE */}
          {shareMode !== "PRIVATE" && (
            <div className="space-y-2">
              <Label>Shareable URL</Label>
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly />
                <Button type="button" variant="outline" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <Button type="button">Update Share Settings</Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Permanently delete this collection and all its bookmarks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteConfirmDialog
            title="Delete Collection"
            description={`Are you sure you want to delete "${collection.name}"? This will permanently delete the collection and all its bookmarks.`}
            onConfirm={() => {
              // TODO: Call deleteCollection(collection.id)
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
