"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ArrayItem } from "@/shared/model";
import type { BarHighlight } from "@/entities/array";
import { runSort, type SortAlgorithm, type SortOptions } from "@/entities/sort-algorithm";
import { Track, type TrackStats } from "./track";

/** 1배속 = 초당 10개 연산 */
export const BASE_OPS_PER_SECOND = 10;
export const SPEEDS = [0.25, 0.5, 1, 2, 4, 8, 16, 64, 256, 1024] as const;
export const DEFAULT_SPEED = 1;
/** 한 프레임에 처리할 최대 연산 수 (탭 멈춤 방지) */
const MAX_OPS_PER_FRAME = 20_000;

export type PlayerSlot = { algorithm: SortAlgorithm; options: SortOptions };

export type PlayerStatus = "idle" | "playing" | "paused" | "done";

export type TrackView = {
  items: readonly ArrayItem[];
  highlight: BarHighlight;
  stats: TrackStats;
  cursor: number;
  /** 준비 전(idle)에는 null */
  total: number | null;
  done: boolean;
  truncated: boolean;
  /** 현재 연산을 만든 설명 코드 줄 (없으면 0) */
  line: number;
  /** 줄별 실행 횟수 (인덱스 = 줄 번호) */
  lineHits: readonly number[];
};

const ZERO_STATS: TrackStats = { compares: 0, swaps: 0, moves: 0, reads: 0 };
const NO_HITS: readonly number[] = [];

function toView(track: Track): TrackView {
  return {
    items: [...track.array],
    // 끝나면 마지막 연산 강조를 지워 완료 색이 온전히 보이게 한다
    highlight: track.done ? null : track.highlight(),
    stats: { ...track.stats },
    cursor: track.cursor,
    total: track.total,
    done: track.done,
    truncated: track.truncated,
    line: track.done ? 0 : track.line,
    lineHits: [...track.lineHits],
  };
}

function slotsKey(slots: readonly PlayerSlot[]) {
  return slots.map((s) => `${s.algorithm.id}:${JSON.stringify(s.options)}`).join("|");
}

type Params = {
  input: readonly ArrayItem[];
  slots: readonly PlayerSlot[];
  speed: number;
};

/**
 * 정렬 연산 로그를 재생한다.
 * 입력 배열(참조)이나 알고리즘 구성이 바뀌면 자동으로 idle 상태로 돌아간다.
 */
export function useSortPlayer({ input, slots, speed }: Params) {
  const key = slotsKey(slots);
  const tracksRef = useRef<Track[]>([]);
  const [session, setSession] = useState<{ input: readonly ArrayItem[]; key: string } | null>(null);
  const [views, setViews] = useState<TrackView[]>([]);
  const [playing, setPlaying] = useState(false);

  const ready = session !== null && session.input === input && session.key === key;

  const publish = useCallback(() => {
    setViews(tracksRef.current.map(toView));
  }, []);

  /** 현재 구성에 맞는 트랙을 준비한다 (이미 준비됐으면 재사용). */
  const ensureTracks = () => {
    if (ready) return tracksRef.current;
    const tracks = slots.map((s) => new Track(input, runSort(s.algorithm, input, s.options)));
    tracksRef.current = tracks;
    setSession({ input, key });
    // 구성이 바뀌어 남아 있던 재생 상태가 새 트랙을 자동 재생하지 않도록 (play()는 이후 다시 true로 설정)
    setPlaying(false);
    return tracks;
  };

  const play = () => {
    const tracks = ensureTracks();
    if (tracks.every((t) => t.done)) tracks.forEach((t) => t.seek(0));
    publish();
    setPlaying(true);
  };

  const pause = () => setPlaying(false);

  const step = (delta: 1 | -1) => {
    const tracks = ensureTracks();
    setPlaying(false);
    tracks.forEach((t) => (delta > 0 ? t.forward() : t.backward()));
    publish();
  };

  /** 모든 트랙을 같은 연산 위치로 이동 (트랙마다 끝을 넘지 않음) */
  const seek = (cursor: number) => {
    const tracks = ensureTracks();
    setPlaying(false);
    tracks.forEach((t) => t.seek(cursor));
    publish();
  };

  const reset = () => {
    setPlaying(false);
    setSession(null);
    tracksRef.current = [];
  };

  const active = playing && ready;

  useEffect(() => {
    if (!active) return;
    const opsPerSecond = BASE_OPS_PER_SECOND * speed;
    let last = performance.now();
    let budget = 1; // 재생을 누르면 즉시 한 단계 진행
    let frame = 0;

    const tick = (now: number) => {
      budget += ((now - last) / 1000) * opsPerSecond;
      last = now;
      const count = Math.min(MAX_OPS_PER_FRAME, Math.floor(budget));
      budget -= count;

      if (count > 0) {
        for (const track of tracksRef.current) {
          for (let k = 0; k < count && track.forward(); k++);
        }
        publish();
      }

      if (tracksRef.current.every((t) => t.done)) {
        setPlaying(false);
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, speed, publish]);

  const idleViews = useMemo<TrackView[]>(
    () =>
      slots.map(() => ({
        items: input,
        highlight: null,
        stats: ZERO_STATS,
        cursor: 0,
        total: null,
        done: false,
        truncated: false,
        line: 0,
        lineHits: NO_HITS,
      })),
    [input, slots]
  );

  const shown = ready ? views : idleViews;
  const allDone = ready && shown.every((v) => v.done);
  const status: PlayerStatus = !ready ? "idle" : active ? "playing" : allDone ? "done" : "paused";

  return {
    status,
    views: shown,
    cursor: Math.max(0, ...shown.map((v) => v.cursor)),
    total: ready ? Math.max(0, ...shown.map((v) => v.total ?? 0)) : null,
    play,
    pause,
    toggle: () => (active ? pause() : play()),
    stepForward: () => step(1),
    stepBackward: () => step(-1),
    seek,
    reset,
  };
}

export type SortPlayer = ReturnType<typeof useSortPlayer>;
