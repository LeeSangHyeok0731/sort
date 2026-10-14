"use client";

import { cn } from "@/shared/lib";

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
        "w-9 h-9 flex items-center justify-center rounded-xl transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-indigo-400",
        enabled ? "text-indigo-200 bg-indigo-500/20" : "text-white/40 hover:text-white hover:bg-white/10"
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
        aria-hidden
      >
        <path d="M11 5 6 9H3v6h3l5 4V5Z" fill="currentColor" />
        {enabled ? (
          <>
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M18.5 5.5a9 9 0 0 1 0 13" />
          </>
        ) : (
          <>
            <path d="m16 9 5 6" />
            <path d="m21 9-5 6" />
          </>
        )}
      </svg>
    </button>
  );
}
