"use client";

import { cn } from "@/shared/lib";
import SpeakerIcon from "./SpeakerIcon";

type Props = {
  slot: 0 | 1;
  /** 알고리즘 이름 (스크린 리더용) */
  name: string;
  muted: boolean;
  onToggle: () => void;
};

/** 슬롯 색에 맞춘 강조 (1번 파랑, 2번 보라) */
const ON_CLASS = ["text-slot-1 bg-blue-50 dark:bg-blue-500/15", "text-slot-2 bg-violet-50 dark:bg-violet-500/15"] as const;

/** 비교 모드에서 한쪽 알고리즘의 소리만 끄고 켜는 버튼 */
export default function SlotMuteButton({ slot, name, muted, onToggle }: Props) {
  const label = `${slot + 1}번 ${name} 소리 ${muted ? "켜기" : "끄기"}`;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={!muted}
      aria-label={label}
      title={label}
      className={cn(
        "shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-foreground",
        muted ? "text-faint hover:text-muted hover:bg-subtle" : ON_CLASS[slot]
      )}
    >
      <SpeakerIcon on={!muted} className="w-3.5 h-3.5" />
    </button>
  );
}
