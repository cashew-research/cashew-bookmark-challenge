// =============================================================================
// Delete Confirm Dialog - CANDIDATE IMPLEMENTS
// =============================================================================
// A reusable confirmation dialog for destructive actions.
//
// - Add loading state while deletion is in progress
// - Handle errors from the onConfirm callback
// - Close dialog after successful deletion
// =============================================================================

"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface DeleteConfirmDialogProps {
  title: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  trigger?: React.ReactNode;
  open?: boolean;
  onCancel?: () => void;
}

export function DeleteConfirmDialog({
  title,
  description,
  onConfirm,
  trigger,
  open: controlledOpen,
  onCancel: controlledOnCancel,
}: DeleteConfirmDialogProps) {
  // Internal state to manage dialog visibility
  const [internalOpen, setInternalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // Choose which to use
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const handleClose = () => {
    if (isControlled) {
      controlledOnCancel?.();
    } else {
      setInternalOpen(false);
    }
  };

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    setIsDeleting(true);
    try {
      await onConfirm();
      handleClose(); // we only close on success
    } catch (error) {
      // Handle error
      console.error("Deletion failed:", error);
      toast.error("Deletion failed. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(val) => {
        // handle escape
        if (!val) handleClose();
        if (val && !isControlled) setInternalOpen(true);
      }}
    >
      {/* Only render trigger if we are in uncontrolled mode and have a trigger */}
      {!isControlled && (
        <AlertDialogTrigger asChild>
          {trigger ?? (
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </AlertDialogTrigger>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose} disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          {/* IMPORTANT: Use Button instead of AlertDialogAction to prevent auto-close */}
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <> 
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
