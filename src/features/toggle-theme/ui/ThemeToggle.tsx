"use client";

import { cn, setTheme, useTheme } from "@/shared/lib";
import ThemeIcon from "./ThemeIcon";

export default function ThemeToggle({ className }: { className?: string }) {
  const dark = useTheme() === "dark";
  const label = dark ? "밝은 테마로" : "어두운 테마로";
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={label}
      title={label}
      className={cn(
        "w-9 h-9 flex items-center justify-center rounded-lg transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-foreground",
        "text-muted hover:text-foreground hover:bg-subtle",
        className
      )}
    >
      <ThemeIcon dark={dark} />
    </button>
  );
}
