"use client";

import { useState } from "react";
import { ExternalLink, Pencil, Trash2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TagBadges } from "@/components/tag-input";

interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string | null;
  tags?: string | null; // JSON string array
  createdAt: Date;
}

interface BookmarkCardProps {
  bookmark: Bookmark;
  readonly?: boolean;
  onEdit?: (bookmark: Bookmark) => void;
  onDelete?: (bookmark: Bookmark) => void;
}

/**
 * Get favicon URL for a given website URL using Google's favicon service.
 * Falls back gracefully if the favicon can't be loaded.
 */
function getFaviconUrl(url: string): string | null {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return null;
  }
}

/**
 * Parse tags from JSON string to array
 */
function parseTags(tagsJson?: string | null): string[] {
  if (!tagsJson) return [];
  try {
    const parsed = JSON.parse(tagsJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function BookmarkCard({
  bookmark,
  readonly = false,
  onEdit,
  onDelete,
}: BookmarkCardProps) {
  const [faviconError, setFaviconError] = useState(false);

  // Truncate URL for display
  const displayUrl = bookmark.url.length > 50
    ? bookmark.url.substring(0, 50) + "..."
    : bookmark.url;

  const faviconUrl = getFaviconUrl(bookmark.url);
  const tags = parseTags(bookmark.tags);

  return (
    <Card className="group transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {/* Favicon */}
            <div className="flex-shrink-0 mt-0.5">
              {faviconUrl && !faviconError ? (
                <img
                  src={faviconUrl}
                  alt=""
                  width={20}
                  height={20}
                  className="rounded transition-transform group-hover:scale-110"
                  onError={() => setFaviconError(true)}
                />
              ) : (
                <Globe className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              <CardTitle className="text-base">
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline inline-flex items-center gap-1 text-foreground hover:text-primary transition-colors"
                >
                  {bookmark.title}
                  <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                </a>
              </CardTitle>
              <CardDescription className="truncate">
                {displayUrl}
              </CardDescription>
            </div>
          </div>

          {!readonly && (onEdit || onDelete) && (
            <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
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
                  className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
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

      {(bookmark.description || tags.length > 0) && (
        <CardContent className="pt-0 space-y-2">
          {bookmark.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {bookmark.description}
            </p>
          )}
          {tags.length > 0 && <TagBadges tags={tags} />}
        </CardContent>
      )}
    </Card>
  );
}
