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
import { useRouter } from "next/navigation";
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
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

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
  const router = useRouter();

  // Basic info state
  const [name, setName] = useState(collection.name);
  const [description, setDescription] = useState(collection.description ?? "");
  const [isUpdatingInfo, setIsUpdatingInfo] = useState(false);
  const [infoError, setInfoError] = useState("");

  // Share settings state
  const [shareMode, setShareMode] = useState<ShareMode>(collection.shareMode);
  const [sharePassword, setSharePassword] = useState("");
  const [isUpdatingShare, setIsUpdatingShare] = useState(false);
  const [shareError, setShareError] = useState("");

  // Copy URL state
  const [copied, setCopied] = useState(false);

  // Delete state
  const [, setIsDeleting] = useState(false);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/share/${collection.slug}`
    : `/share/${collection.slug}`;

  async function handleUpdateInfo(e: React.FormEvent) {
    e.preventDefault();
    setIsUpdatingInfo(true);
    setInfoError("");

    try {
      const result = await updateCollection(collection.id, {
        name,
        description: description || undefined,
      });

      if (result.success) {
        toast.success("Collection details updated");
      } else {
        setInfoError(result.error || "Failed to update collection");
      }
    } catch {
      setInfoError("An unexpected error occurred");
    } finally {
      setIsUpdatingInfo(false);
    }
  }

  async function handleUpdateShare() {
    setIsUpdatingShare(true);
    setShareError("");

    try {
      const result = await updateCollection(collection.id, {
        shareMode,
        sharePassword: shareMode === "PASSWORD_PROTECTED" && sharePassword
          ? sharePassword
          : null,
      });

      if (result.success) {
        toast.success("Share settings updated");
        setSharePassword(""); // Clear password after successful update
      } else {
        setShareError(result.error || "Failed to update share settings");
      }
    } catch {
      setShareError("An unexpected error occurred");
    } finally {
      setIsUpdatingShare(false);
    }
  }

  async function handleCopyUrl() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("URL copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  }

  async function handleDelete() {
    setIsDeleting(true);

    try {
      const result = await deleteCollection(collection.id);

      if (result.success) {
        toast.success("Collection deleted");
        router.push("/collections");
      } else {
        toast.error(result.error || "Failed to delete collection");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Collection Details</CardTitle>
          <CardDescription>Update your collection name and description.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateInfo} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isUpdatingInfo}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this collection about?"
                disabled={isUpdatingInfo}
              />
            </div>

            {infoError && (
              <p className="text-sm text-destructive">{infoError}</p>
            )}

            <Button type="submit" disabled={isUpdatingInfo || !name.trim()}>
              {isUpdatingInfo ? "Saving..." : "Save Changes"}
            </Button>
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
            <ShareModeSelect
              value={shareMode}
              onChange={setShareMode}
              disabled={isUpdatingShare}
            />
          </div>

          {/* TODO: Show password field when PASSWORD_PROTECTED */}
          {shareMode === "PASSWORD_PROTECTED" && (
            <div className="space-y-2">
              <Label htmlFor="password">Share Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter a new password"
                value={sharePassword}
                onChange={(e) => setSharePassword(e.target.value)}
                disabled={isUpdatingShare}
              />
              <p className="text-xs text-muted-foreground">
                Visitors will need this password to view the collection.
                Leave blank to keep the current password.
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
                  onClick={handleCopyUrl}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          {shareError && (
            <p className="text-sm text-destructive">{shareError}</p>
          )}

          <Button
            type="button"
            onClick={handleUpdateShare}
            disabled={isUpdatingShare}
          >
            {isUpdatingShare ? "Updating..." : "Update Share Settings"}
          </Button>
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
            onConfirm={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
}
