"use client";

import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";

/**
 * Color palette for tags - inspired by social media platforms
 * Each tag gets a consistent color based on its content hash
 */
const TAG_COLORS = [
  { bg: "bg-rose-100 dark:bg-rose-950", text: "text-rose-700 dark:text-rose-300", border: "border-rose-200 dark:border-rose-800" },
  { bg: "bg-orange-100 dark:bg-orange-950", text: "text-orange-700 dark:text-orange-300", border: "border-orange-200 dark:border-orange-800" },
  { bg: "bg-amber-100 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
  { bg: "bg-emerald-100 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" },
  { bg: "bg-teal-100 dark:bg-teal-950", text: "text-teal-700 dark:text-teal-300", border: "border-teal-200 dark:border-teal-800" },
  { bg: "bg-cyan-100 dark:bg-cyan-950", text: "text-cyan-700 dark:text-cyan-300", border: "border-cyan-200 dark:border-cyan-800" },
  { bg: "bg-sky-100 dark:bg-sky-950", text: "text-sky-700 dark:text-sky-300", border: "border-sky-200 dark:border-sky-800" },
  { bg: "bg-indigo-100 dark:bg-indigo-950", text: "text-indigo-700 dark:text-indigo-300", border: "border-indigo-200 dark:border-indigo-800" },
  { bg: "bg-violet-100 dark:bg-violet-950", text: "text-violet-700 dark:text-violet-300", border: "border-violet-200 dark:border-violet-800" },
  { bg: "bg-purple-100 dark:bg-purple-950", text: "text-purple-700 dark:text-purple-300", border: "border-purple-200 dark:border-purple-800" },
  { bg: "bg-fuchsia-100 dark:bg-fuchsia-950", text: "text-fuchsia-700 dark:text-fuchsia-300", border: "border-fuchsia-200 dark:border-fuchsia-800" },
  { bg: "bg-pink-100 dark:bg-pink-950", text: "text-pink-700 dark:text-pink-300", border: "border-pink-200 dark:border-pink-800" },
];

/**
 * Get a consistent color for a tag based on its content
 */
export function getTagColor(tag: string) {
  // Simple hash function to get consistent color per tag
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = ((hash << 5) - hash) + tag.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % TAG_COLORS.length;
  return TAG_COLORS[index];
}

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
  maxTags?: number;
  maxLength?: number;
  placeholder?: string;
}

export function TagInput({
  tags,
  onChange,
  disabled = false,
  maxTags = 10,
  maxLength = 50,
  placeholder = "Add tag...",
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTag = (tagToAdd: string) => {
    const trimmedTag = tagToAdd.trim().toLowerCase();

    // Validation
    if (!trimmedTag) return;
    if (trimmedTag.length > maxLength) return;
    if (tags.length >= maxTags) return;
    if (tags.includes(trimmedTag)) return; // Prevent duplicates

    onChange([...tags, trimmedTag]);
    setInputValue("");
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Add tag on Enter or comma
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    }

    // Remove last tag on Backspace if input is empty
    if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    // Split by comma and add each as a tag
    const newTags = pastedText.split(",").map(t => t.trim()).filter(Boolean);
    const uniqueNewTags = newTags.filter(t => !tags.includes(t.toLowerCase()));
    const tagsToAdd = uniqueNewTags.slice(0, maxTags - tags.length);
    if (tagsToAdd.length > 0) {
      onChange([...tags, ...tagsToAdd.map(t => t.toLowerCase())]);
    }
  };

  return (
    <div className="space-y-2">
      {/* Tags display */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, index) => {
            const color = getTagColor(tag);
            return (
              <span
                key={`${tag}-${index}`}
                className={`
                  inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
                  border transition-all duration-150 animate-in fade-in zoom-in-95
                  ${color.bg} ${color.text} ${color.border}
                  ${disabled ? "opacity-60" : ""}
                `}
              >
                <span className="max-w-[120px] truncate">{tag}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-1 focus:ring-offset-0"
                    aria-label={`Remove ${tag}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
            );
          })}
        </div>
      )}

      {/* Input field */}
      {!disabled && tags.length < maxTags && (
        <div className="relative">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onBlur={() => {
              if (inputValue.trim()) {
                addTag(inputValue);
              }
            }}
            placeholder={tags.length === 0 ? placeholder : "Add another..."}
            disabled={disabled}
            className="text-sm"
            maxLength={maxLength}
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
            {tags.length}/{maxTags}
          </span>
        </div>
      )}

      {/* Helper text */}
      {!disabled && tags.length < maxTags && (
        <p className="text-xs text-muted-foreground">
          Press <kbd className="px-1 py-0.5 rounded bg-muted text-xs">Enter</kbd> or <kbd className="px-1 py-0.5 rounded bg-muted text-xs">,</kbd> to add a tag
        </p>
      )}
    </div>
  );
}

/**
 * Read-only tag display component for bookmark cards
 */
interface TagBadgesProps {
  tags: string[];
  maxVisible?: number;
}

export function TagBadges({ tags, maxVisible = 5 }: TagBadgesProps) {
  if (!tags || tags.length === 0) return null;

  const visibleTags = tags.slice(0, maxVisible);
  const remainingCount = tags.length - maxVisible;

  return (
    <div className="flex flex-wrap gap-1">
      {visibleTags.map((tag, index) => {
        const color = getTagColor(tag);
        return (
          <span
            key={`${tag}-${index}`}
            className={`
              inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
              border transition-colors
              ${color.bg} ${color.text} ${color.border}
              hover:brightness-95
            `}
          >
            {tag}
          </span>
        );
      })}
      {remainingCount > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
          +{remainingCount} more
        </span>
      )}
    </div>
  );
}
