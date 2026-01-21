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
  const [copied, setCopied] = useState(false);
  
  const [basicInfoError, setBasicInfoError] = useState<string | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [isUpdatingBasicInfo, setIsUpdatingBasicInfo] = useState(false);
  const [isUpdatingAccess, setIsUpdatingAccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);

    setTimeout(() => setCopied(false), 400);
  };

  async function handleUpdateBasicInfo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBasicInfoError(null);
    setIsUpdatingBasicInfo(true);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    const result = await updateCollection(collection.id, {
        name,
        description,
    });

    if (!result.success) {
      setBasicInfoError(JSON.parse(result.error)[0]?.message || "Something went wrong")
    }

    setIsUpdatingBasicInfo(false);
  }

  async function handleUpdateAccessPolicy(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAccessError(null);
    setIsUpdatingAccess(true);

    const formData = new FormData(event.currentTarget);
    const sharePassword = formData.get("sharePassword") as string;

    const result = await updateCollection(collection.id, {
        shareMode, 
        ...(shareMode === "PASSWORD_PROTECTED" && { sharePassword: sharePassword })
    });

    if (!result.success) {
      setAccessError(JSON.parse(result.error)[0]?.message || "Something went wrong")
    }

    setIsUpdatingAccess(false)
  }

  async function handleDeleteCollection() {
    setIsDeleting(true);
    setDeleteError(null);

    const result = await deleteCollection(collection.id);

    if (!result.success) {
      setDeleteError(JSON.parse(result.error)[0]?.message || "Something went wrong")
    }
    setIsDeleting(false);
  }


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
          <form onSubmit={handleUpdateBasicInfo}  className="space-y-4">
            {basicInfoError && <p className="text-sm font-medium text-red-500">{basicInfoError}</p>}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={collection.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={collection.description ?? ""}
                placeholder="What's this collection about?"
              />
            </div>
            <Button type="submit" disabled={isUpdatingBasicInfo}>{isUpdatingBasicInfo ? "Saving..." : "Save Changes"}</Button>
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
          <form onSubmit={handleUpdateAccessPolicy}>
            {accessError && <p className="text-sm font-medium text-red-500">{accessError}</p>}
            <div className="space-y-2">
              <Label>Share Mode</Label>
              <ShareModeSelect value={shareMode} onChange={setShareMode} />
            </div>

            {/* TODO: Show password field when PASSWORD_PROTECTED */}
            {shareMode === "PASSWORD_PROTECTED" && (
              <div className="space-y-2">
                <Label htmlFor="password">Share Password</Label>
                <Input id="password" type="password" name="sharePassword" placeholder="Enter a password" />
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
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleCopy()}
                  >
                   <Copy
                    className={`h-4 w-4 ${
                      copied ? "text-green-500" : "text-gray-700"
                    }`}
                  />
                  </Button>
                </div>
              </div>
            )}

            <Button type="submit" disabled={isUpdatingAccess}>{isUpdatingAccess ? "Updating..." : "Update Share Settings"}</Button>
          </form>
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
          {deleteError && <p className="text-sm font-medium text-red-500">{deleteError}</p>}
          <DeleteConfirmDialog
            title="Delete Collection"
            description={`Are you sure you want to delete "${collection.name}"? This will permanently delete the collection and all its bookmarks.`}
            onConfirm={handleDeleteCollection}
            disabled={isDeleting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
