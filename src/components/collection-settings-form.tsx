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
import { toast } from "sonner";
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
import { Copy, Loader2 } from "lucide-react";

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

export function CollectionSettingsForm({
  collection,
}: CollectionSettingsFormProps) {
  const router = useRouter();
  const [shareMode, setShareMode] = useState<ShareMode>(collection.shareMode);
  const [isUpdatingDetails, setIsUpdatingDetails] = useState(false);
  const [isUpdatingShare, setIsUpdatingShare] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>(
    {},
  );

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/share/${collection.slug}`
      : `/share/${collection.slug}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Shareable URL copied to clipboard");
  };

  // Handler for Name/Description
  async function handleUpdateDetails(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsUpdatingDetails(true);
    const formData = new FormData(e.currentTarget);

    const result = await updateCollection(collection.id, {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
    });

    if (result.success) toast.success("Details updated");
    else {
      toast.error(result.message || "Failed to update details");
      if (result.errors) {
        setFieldErrors(result.errors);
      }
    }
    setIsUpdatingDetails(false);
  }

  // Handler for Share Settings
  async function handleUpdateShare(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsUpdatingShare(true);
    const formData = new FormData(e.currentTarget);

    const result = await updateCollection(collection.id, {
      shareMode,
      sharePassword: (formData.get("password") as string) || undefined,
    });

    if (result.success) toast.success("Sharing settings updated");
    else {
      toast.error(result.message || "Failed to update sharing");
      if (result.errors) {
        setFieldErrors(result.errors);
      }
    }

    setIsUpdatingShare(false);
  }

  async function handleDelete() {
    const result = await deleteCollection(collection.id);
    if (result.success) {
      toast.success("Collection deleted");
      router.push("/collections");
    } else {
      toast.error(result.message || "Failed to delete collection");
      throw new Error(result.message); // Don't close the dialog
    }
  }
  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Collection Details</CardTitle>
          <CardDescription>
            Update your collection name and description.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleUpdateDetails}>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={collection.name}
              />
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
            <Button type="submit" disabled={isUpdatingDetails}>
              {isUpdatingDetails && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Share Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Share Settings</CardTitle>
          <CardDescription>
            Control who can access this collection.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleUpdateShare} className="space-y-4">
            <div className="space-y-2">
              <Label>Share Mode</Label>
              <ShareModeSelect value={shareMode} onChange={setShareMode} />
            </div>

            {shareMode === "PASSWORD_PROTECTED" && (
              <div className="space-y-2">
                <Label htmlFor="password">Share Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter a password"
                  className={
                    fieldErrors.sharePassword
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }
                  onChange={() => {
                    if (fieldErrors.sharePassword) {
                      setFieldErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.sharePassword;
                        return newErrors;
                      });
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Visitors will need this password to view the collection.
                </p>
                {fieldErrors.sharePassword && (
                  <p className="text-sm font-medium text-destructive">
                    {fieldErrors.sharePassword[0]}
                  </p>
                )}
              </div>
            )}

            {shareMode !== "PRIVATE" && (
              <div className="space-y-2">
                <Label>Shareable URL</Label>
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly className="bg-muted" />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={copyToClipboard}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <Button type="submit" disabled={isUpdatingShare}>
              {isUpdatingShare && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Share Settings
            </Button>
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
