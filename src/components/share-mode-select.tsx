"use client";

import { Globe, KeyRound, Lock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ShareMode = "PRIVATE" | "LINK_ACCESS" | "PASSWORD_PROTECTED";

interface ShareModeSelectProps {
  value: ShareMode;
  onChange: (value: ShareMode) => void;
  disabled?: boolean;
}

const shareModeOptions: Array<{
  value: ShareMode;
  label: string;
  description: string;
  icon: typeof Lock;
}> = [
  {
    value: "PRIVATE",
    label: "Private",
    description: "Only you can view",
    icon: Lock,
  },
  {
    value: "LINK_ACCESS",
    label: "Link Access",
    description: "Anyone with the link can view",
    icon: Globe,
  },
  {
    value: "PASSWORD_PROTECTED",
    label: "Password Protected",
    description: "Requires password to view",
    icon: KeyRound,
  },
];

export function ShareModeSelect({
  value,
  onChange,
  disabled = false,
}: ShareModeSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as ShareMode)}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select share mode" />
      </SelectTrigger>
      <SelectContent>
        {shareModeOptions.map((option) => {
          const Icon = option.icon;
          return (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {option.description}
                  </div>
                </div>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
