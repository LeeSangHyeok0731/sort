"use client";

import { cn } from "@/shared/lib";
import SpeakerIcon from "./SpeakerIcon";

type Props = {
  enabled: boolean;
  onToggle: () => void;
};

export default function SoundToggle({ enabled, onToggle }: Props) {
  const label = enabled ? "소리 끄기" : "소리 켜기";
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={enabled}
      aria-label={label}
      title={`${label} (M)`}
      className={cn(
        "w-9 h-9 flex items-center justify-center rounded-lg transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-foreground",
        enabled ? "text-white bg-foreground" : "text-muted hover:text-foreground hover:bg-subtle"
      )}
    >
      <SpeakerIcon on={enabled} />
    </button>
  );
}
