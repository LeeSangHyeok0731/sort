"use client";

import { cn } from "@/shared/lib";
import { SPEEDS, type SortPlayer } from "../model/useSortPlayer";
import { PauseIcon, PlayIcon, RewindIcon, ShuffleIcon, SpinnerIcon, StepBackIcon, StepForwardIcon } from "./icons";

type Props = {
  player: SortPlayer;
  speed: number;
  onSpeedChange: (speed: number) => void;
  onShuffle: () => void;
  /** 배열이 너무 작아 재생할 수 없음 */
  disabled?: boolean;
  /** 컨트롤 버튼 줄 끝에 붙일 추가 버튼 (예: 소리 켜기) */
  extraControls?: React.ReactNode;
};

function IconButton({
  label,
  shortcut,
  onClick,
  disabled,
  children,
  variant = "ghost",
}: {
  label: string;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: "ghost" | "primary" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={shortcut ? `${label} (${shortcut})` : label}
      className={cn(
        "flex items-center justify-center rounded-xl transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-indigo-400",
        variant === "ghost" && "w-9 h-9 text-white/60 hover:text-white hover:bg-white/10",
        variant === "primary" &&
          "w-11 h-11 bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.45)]",
        variant === "danger" &&
          "w-11 h-11 bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.4)]"
      )}
    >
      {children}
    </button>
  );
}

export default function PlaybackBar({ player, speed, onSpeedChange, onShuffle, disabled, extraControls }: Props) {
  const { status, cursor, total } = player;
  const playing = status === "playing";
  const computing = status === "computing";
  const speedIndex = Math.max(0, SPEEDS.indexOf(speed as (typeof SPEEDS)[number]));
  const progress = total ? cursor / total : status === "done" ? 1 : 0;

  let mainLabel = "재생";
  if (playing) mainLabel = "일시정지";
  else if (computing) mainLabel = "계산 취소";
  else if (status === "done") mainLabel = "다시 재생";

  const statusText = {
    idle: "준비됨",
    computing: "계산 중…",
    playing: "재생 중",
    paused: "일시정지",
    done: "완료",
  }[status];

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-5">
      <div className="flex items-center justify-center gap-1">
        <IconButton label="처음으로" onClick={() => player.seek(0)} disabled={disabled || computing || cursor === 0}>
          <RewindIcon />
        </IconButton>
        <IconButton
          label="한 단계 뒤로"
          shortcut="←"
          onClick={player.stepBackward}
          disabled={disabled || computing || cursor === 0}
        >
          <StepBackIcon />
        </IconButton>
        <IconButton
          label={mainLabel}
          shortcut="Space"
          onClick={player.toggle}
          disabled={disabled}
          variant={playing ? "danger" : "primary"}
        >
          {computing ? (
            <SpinnerIcon className="w-5 h-5" />
          ) : playing ? (
            <PauseIcon className="w-5 h-5" />
          ) : (
            <PlayIcon className="w-5 h-5 translate-x-px" />
          )}
        </IconButton>
        <IconButton
          label="한 단계 앞으로"
          shortcut="→"
          onClick={player.stepForward}
          disabled={disabled || computing || status === "done"}
        >
          <StepForwardIcon />
        </IconButton>
        <IconButton label="새 배열" shortcut="R" onClick={onShuffle}>
          <ShuffleIcon />
        </IconButton>
        {extraControls}
      </div>

      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <div className="flex justify-between gap-3 whitespace-nowrap text-[11px] font-mono text-white/40">
          <span className={cn(computing && "text-indigo-300 animate-pulse")} aria-live="polite">
            {statusText}
          </span>
          <span>
            <span className="text-indigo-300">{cursor.toLocaleString()}</span>
            {" / "}
            {total === null ? "—" : total.toLocaleString()} 연산
          </span>
        </div>
        <div className="relative h-5 flex items-center">
          <div className="absolute inset-x-0 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-indigo-500 to-pink-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <input
            type="range"
            aria-label="진행 위치"
            min={0}
            max={total ?? 0}
            value={cursor}
            disabled={disabled || computing || !total}
            onChange={(e) => player.seek(Number(e.target.value))}
            className="scrubber absolute inset-x-0 w-full"
          />
        </div>
      </div>

      <label className="flex items-center gap-3 md:w-56">
        <span className="shrink-0 whitespace-nowrap text-[11px] font-bold text-white/40">속도</span>
        <input
          type="range"
          aria-label="재생 속도"
          min={0}
          max={SPEEDS.length - 1}
          value={speedIndex}
          onChange={(e) => onSpeedChange(SPEEDS[Number(e.target.value)])}
          className="flex-1 accent-indigo-500"
        />
        <span className="w-14 text-right text-sm font-mono font-bold text-indigo-300">×{speed}</span>
      </label>
    </div>
  );
}
