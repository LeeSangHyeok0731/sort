"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ArrayItem } from "@/shared/model";
import type { BarHighlight } from "@/entities/array";
import type { SortAlgorithm, SortOptions } from "@/entities/sort-algorithm";
import { runSortsInBackground, SortCancelled, type BackgroundSort } from "./runInBackground";
import { Track, type TrackStats } from "./track";

/** 1배속 = 초당 10개 연산 */
export const BASE_OPS_PER_SECOND = 10;
export const SPEEDS = [0.25, 0.5, 1, 2, 4, 8, 16, 64, 256, 1024] as const;
export const DEFAULT_SPEED = 1;
/** 한 프레임에 처리할 최대 연산 수 (탭 멈춤 방지) */
const MAX_OPS_PER_FRAME = 20_000;

export type PlayerSlot = { algorithm: SortAlgorithm; options: SortOptions };

export type PlayerStatus = "idle" | "computing" | "playing" | "paused" | "done";

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

/** 계산이 끝난 뒤 이어서 할 동작 */
type Action = { type: "play" } | { type: "step"; delta: 1 | -1 } | { type: "seek"; cursor: number };

/** 트랙이 어떤 입력·구성으로 만들어졌는지 */
type Config = { input: readonly ArrayItem[]; key: string };

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

function matches(config: Config | null, input: readonly ArrayItem[], key: string) {
  return config !== null && config.input === input && config.key === key;
}

type Params = {
  input: readonly ArrayItem[];
  slots: readonly PlayerSlot[];
  speed: number;
};

/**
 * 정렬 연산 로그를 재생한다.
 * 연산 로그는 Web Worker에서 계산하므로, 수백만 연산을 만드는 알고리즘도 화면을 멈추지 않는다.
 * 입력 배열(참조)이나 알고리즘 구성이 바뀌면 자동으로 idle 상태로 돌아간다.
 */
export function useSortPlayer({ input, slots, speed }: Params) {
  const key = slotsKey(slots);
  const tracksRef = useRef<Track[]>([]);
  const [session, setSession] = useState<Config | null>(null);
  const [computing, setComputing] = useState<Config | null>(null);
  const [views, setViews] = useState<TrackView[]>([]);
  const [playing, setPlaying] = useState(false);

  const jobRef = useRef<BackgroundSort | null>(null);
  const pendingRef = useRef<Action | null>(null);
  /** 계산이 끝났을 때 그 사이 설정이 바뀌었는지 확인하기 위한 최신 구성 */
  const latestRef = useRef<Config>({ input, key });
  useEffect(() => {
    latestRef.current = { input, key };
  }, [input, key]);

  // 화면을 떠나면 진행 중인 계산을 멈춘다
  useEffect(() => () => jobRef.current?.cancel(), []);

  const ready = matches(session, input, key);
  const isComputing = matches(computing, input, key);

  const publish = useCallback(() => {
    setViews(tracksRef.current.map(toView));
  }, []);

  const apply = (tracks: Track[], action: Action) => {
    if (action.type === "play") {
      if (tracks.every((t) => t.done)) tracks.forEach((t) => t.seek(0));
      publish();
      setPlaying(true);
      return;
    }
    setPlaying(false);
    if (action.type === "step") tracks.forEach((t) => (action.delta > 0 ? t.forward() : t.backward()));
    else tracks.forEach((t) => t.seek(action.cursor));
    publish();
  };

  const cancelComputing = () => {
    jobRef.current?.cancel();
    jobRef.current = null;
    pendingRef.current = null;
    setComputing(null);
  };

  /** 트랙이 준비돼 있으면 바로, 아니면 백그라운드 계산이 끝난 뒤 동작을 실행한다 */
  const run = (action: Action) => {
    if (ready) {
      apply(tracksRef.current, action);
      return;
    }
    // 같은 구성으로 이미 계산 중이면 마지막 동작만 기억해 둔다
    pendingRef.current = action;
    if (isComputing) return;

    jobRef.current?.cancel();
    const config: Config = { input, key };
    const job = runSortsInBackground(
      slots.map((s) => ({ algorithmId: s.algorithm.id, input, options: s.options }))
    );
    jobRef.current = job;
    setComputing(config);
    setPlaying(false);

    job.promise.then(
      (results) => {
        if (jobRef.current !== job) return; // 더 새로운 계산이 시작됐다
        jobRef.current = null;
        setComputing(null);
        const latest = latestRef.current;
        if (latest.input !== config.input || latest.key !== config.key) return; // 계산 중 설정이 바뀌었다

        const tracks = results.map((result) => new Track(config.input, result));
        tracksRef.current = tracks;
        setSession(config);
        const next = pendingRef.current;
        pendingRef.current = null;
        if (next) apply(tracks, next);
      },
      (error: unknown) => {
        if (jobRef.current === job) {
          jobRef.current = null;
          setComputing(null);
        }
        if (!(error instanceof SortCancelled)) console.error(error);
      }
    );
  };

  const play = () => run({ type: "play" });

  const pause = () => {
    if (isComputing) cancelComputing();
    setPlaying(false);
  };

  const reset = () => {
    cancelComputing();
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
  let status: PlayerStatus;
  if (!ready) status = isComputing ? "computing" : "idle";
  else if (active) status = "playing";
  else status = allDone ? "done" : "paused";

  return {
    status,
    views: shown,
    cursor: Math.max(0, ...shown.map((v) => v.cursor)),
    total: ready ? Math.max(0, ...shown.map((v) => v.total ?? 0)) : null,
    play,
    pause,
    /** 재생 중이면 일시정지, 계산 중이면 계산 취소, 그 외에는 재생 */
    toggle: () => (active || isComputing ? pause() : play()),
    stepForward: () => run({ type: "step", delta: 1 }),
    stepBackward: () => run({ type: "step", delta: -1 }),
    /** 모든 트랙을 같은 연산 위치로 이동 (트랙마다 끝을 넘지 않음) */
    seek: (cursor: number) => run({ type: "seek", cursor }),
    reset,
  };
}

export type SortPlayer = ReturnType<typeof useSortPlayer>;
