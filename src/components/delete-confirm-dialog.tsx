// =============================================================================
// Delete Confirm Dialog - CANDIDATE IMPLEMENTS
// =============================================================================
// A reusable confirmation dialog for destructive actions.
//
// TODO:
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
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface DeleteConfirmDialogProps {
  title: string;
  description: string;
  disabled: boolean;
  onConfirm: () => void | Promise<void>;
  trigger?: React.ReactNode;
}

export function DeleteConfirmDialog({
  title,
  description,
  onConfirm,
  trigger,
}: DeleteConfirmDialogProps) {
  const [isPending, setIsPending] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  
  const handleConfirm = async () => {
    try {
      setIsPending(true);
      await onConfirm?.();
      setOpen(false);
    } catch (err) {
      console.error("Deletion failed:", err);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
             {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
