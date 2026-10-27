"use client";

import { cn } from "@/shared/lib";

type Props = {
  enabled: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
};

/** 비교 모드(알고리즘 2개 나란히 실행) 스위치 */
export default function CompareToggle({ enabled, onChange, disabled }: Props) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <span className="text-xs text-muted">비교 모드</span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        disabled={disabled}
        onClick={() => onChange(!enabled)}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-40",
          enabled ? "bg-foreground" : "bg-gray-400 dark:bg-gray-600"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 rounded-full bg-background transition-transform",
            enabled ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </label>
  );
}
