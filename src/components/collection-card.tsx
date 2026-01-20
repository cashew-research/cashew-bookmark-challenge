import Link from "next/link";
import { Bookmark, Globe, Lock, KeyRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ShareMode = "PRIVATE" | "LINK_ACCESS" | "PASSWORD_PROTECTED";

interface Collection {
  id: string;
  name: string;
  description?: string | null;
  shareMode: ShareMode;
  _count?: {
    bookmarks: number;
  };
}

interface CollectionCardProps {
  collection: Collection;
}

const shareModeConfig: Record<ShareMode, { label: string; variant: "default" | "secondary" | "outline"; icon: typeof Lock }> = {
  PRIVATE: {
    label: "Private",
    variant: "secondary",
    icon: Lock,
  },
  LINK_ACCESS: {
    label: "Link Access",
    variant: "default",
    icon: Globe,
  },
  PASSWORD_PROTECTED: {
    label: "Password",
    variant: "outline",
    icon: KeyRound,
  },
};

export function CollectionCard({ collection }: CollectionCardProps) {
  const modeConfig = shareModeConfig[collection.shareMode];
  const ModeIcon = modeConfig.icon;
  const bookmarkCount = collection._count?.bookmarks ?? 0;

  return (
    <Link href={`/collections/${collection.id}`}>
      <Card className="group h-full transition-all duration-200 hover:bg-muted/50 hover:shadow-md hover:-translate-y-0.5">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">
              {collection.name}
            </CardTitle>
            <Badge variant={modeConfig.variant} className="flex-shrink-0">
              <ModeIcon className="mr-1 h-3 w-3" />
              {modeConfig.label}
            </Badge>
          </div>

          {collection.description && (
            <CardDescription className="line-clamp-2">
              {collection.description}
            </CardDescription>
          )}

          <div className="flex items-center gap-1 text-sm text-muted-foreground pt-2">
            <Bookmark 
              className={`h-4 w-4 transition-colors ${
                bookmarkCount > 1 
                  ? 'fill-yellow-400 stroke-yellow-500' 
                  : 'stroke-currentColor'
              }`} 
            />
            <span>
              {bookmarkCount} {bookmarkCount === 1 ? "bookmark" : "bookmarks"}
            </span>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
