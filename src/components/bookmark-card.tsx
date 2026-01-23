"use client";

import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string | null;
  createdAt: Date;
}

interface BookmarkCardProps {
  bookmark: Bookmark;
  readonly?: boolean;
  onEdit?: (bookmark: Bookmark) => void;
  onDelete?: (bookmark: Bookmark) => void;
}

export function BookmarkCard({
  bookmark,
  readonly = false,
  onEdit,
  onDelete,
}: BookmarkCardProps) {

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4"> {/* MJ: Increased gap */}
          <div className="space-y-1 min-w-0 flex-1">
            <CardTitle className="text-base leading-tight">
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline block group"
              >
                <span>{bookmark.title}</span>
                <ExternalLink className="inline-block h-3 w-3 ml-1 mb-0.5 text-muted-foreground" />
              </a>
            </CardTitle>
            <CardDescription className="truncate text-xs"> {/* Use CSS truncation instead of JS */}
              {bookmark.url}
            </CardDescription>
          </div>

          {!readonly && (onEdit || onDelete) && (
            <div className="flex gap-2 flex-shrink-0 -mr-2"> {/* MJ: Added -mr-2 to align buttons better */ }
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9" /* MJ: Increased button size for better touch targets */ 
                  onClick={() => onEdit(bookmark)}
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => onDelete(bookmark)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      {bookmark.description && (
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {bookmark.description}
          </p>
        </CardContent>
      )}
    </Card>
  );
}
