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

/** 슬롯 색에 맞춘 강조 (1번 보라, 2번 분홍) */
const ON_CLASS = ["text-indigo-200 bg-indigo-500/20", "text-pink-200 bg-pink-500/20"] as const;

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
        "shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-indigo-400",
        muted ? "text-white/30 hover:text-white/70 hover:bg-white/10" : ON_CLASS[slot]
      )}
    >
      <SpeakerIcon on={!muted} className="w-3.5 h-3.5" />
    </button>
  );
}
