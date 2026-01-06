"use client";

import { useState } from "react";

const SPEEDS = [0.25, 0.5, 0.75, 1, 2, 4];

export const ALGORITHMS = [
  { id: "bubble", name: "버블 정렬", desc: "인접한 두 항을 비교하여 정렬" },
  { id: "selection", name: "선택 정렬", desc: "최솟값을 찾아 앞으로 이동" },
  { id: "insertion", name: "삽입 정렬", desc: "정렬된 부분에 요소를 삽입" },
  { id: "quick", name: "퀵 정렬", desc: "피벗을 기준으로 분할 정렬" },
  { id: "merge", name: "병합 정렬", desc: "반으로 나누어 정렬 후 병합" },
  { id: "heap", name: "힙 정렬", desc: "힙 자료구조를 이용한 정렬" },
  { id: "counting", name: "계수 정렬", desc: "값의 개수를 세서 정렬" },
  { id: "radix", name: "기수 정렬", desc: "자릿수 별로 정렬" },
  { id: "bucket", name: "버킷 정렬", desc: "범위별 버킷에 담아 정렬" },
  { id: "shell", name: "셸 정렬", desc: "간격을 조절하며 삽입 정렬" },
] as const;

export type AlgorithmId = (typeof ALGORITHMS)[number]["id"];

type Props = {
  onStart: () => void;
  onReset: () => void;
  onStop: () => void;
  onCustomArray: (arr: number[]) => void;
  onRandomGenerate: (size: number) => void;
  playing: boolean;
  speedMultiplier: number;
  setSpeedMultiplier: (speed: number) => void;
  selectedAlgo: AlgorithmId;
  setSelectedAlgo: (id: AlgorithmId) => void;
};

export default function ControlPanel({
  onStart,
  onReset,
  onStop,
  onCustomArray,
  onRandomGenerate,
  playing,
  speedMultiplier,
  setSpeedMultiplier,
  selectedAlgo,
  setSelectedAlgo,
}: Props) {
  const [customInput, setCustomInput] = useState("");
  const [randomSize, setRandomSize] = useState(20);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const arr = customInput
      .split(/[, \s]+/)
      .map((v) => parseInt(v.trim()))
      .filter((v) => !isNaN(v));
    if (arr.length > 0) {
      onCustomArray(arr);
      setCustomInput("");
    }
  };

  return (
    <div className="flex flex-col gap-6 mt-8 w-full max-w-4xl">
      {/* Algorithm Selection */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {ALGORITHMS.map((algo) => (
          <button
            key={algo.id}
            onClick={() => setSelectedAlgo(algo.id)}
            disabled={playing}
            className={`
              px-3 py-3 rounded-xl text-sm font-bold transition-all border
              ${
                selectedAlgo === algo.id
                  ? "bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.2)]"
                  : "bg-white/5 border-white/10 text-white/40 hover:text-white/60 hover:bg-white/10"
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {algo.name}
          </button>
        ))}
      </div>

      {/* Primary Actions & Speed */}
      <div className="flex flex-col md:flex-row items-center gap-6 bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-xl px-8">
        <div className="flex gap-3 w-full md:w-auto">
          {!playing ? (
            <button
              onClick={onStart}
              className="flex-1 md:flex-none px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all duration-200 shadow-[0_0_20px_rgba(79,70,229,0.4)] active:scale-95"
            >
              정렬 시작
            </button>
          ) : (
            <button
              onClick={onStop}
              className="flex-1 md:flex-none px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-all duration-200 shadow-[0_0_20px_rgba(225,29,72,0.4)] active:scale-95"
            >
              중단하기
            </button>
          )}
          <button
            onClick={onReset}
            className="flex-1 md:flex-none px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all duration-200 border border-white/10 active:scale-95"
          >
            초기화
          </button>
        </div>

        <div className="h-px w-full md:w-px md:h-8 bg-white/10 mx-2" />

        <div className="flex flex-col gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-white/40 px-1 uppercase tracking-wider">
            Speed
          </span>
          <div className="flex gap-1 bg-black/20 p-1 rounded-lg">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => setSpeedMultiplier(s)}
                className={`
                  px-3 py-1.5 rounded-md text-xs font-bold transition-all
                  ${
                    speedMultiplier === s
                      ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                      : "text-white/40 hover:text-white/70 hover:bg-white/5"
                  }
                `}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inputs Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <form
          onSubmit={handleCustomSubmit}
          className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-xl flex flex-col gap-3"
        >
          <span className="text-xs font-bold text-white/40 px-1 uppercase tracking-wider">
            Custom Array
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="예: 10, 50, 20, 80..."
              disabled={playing}
              className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="submit"
              disabled={playing || !customInput.trim()}
              className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 rounded-xl font-bold border border-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              적용
            </button>
          </div>
        </form>

        <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-xl flex flex-col gap-3">
          <span className="text-xs font-bold text-white/40 px-1 uppercase tracking-wider">
            Random Generation
          </span>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={randomSize}
              onChange={(e) =>
                setRandomSize(
                  Math.min(100, Math.max(2, parseInt(e.target.value) || 0))
                )
              }
              disabled={playing}
              className="w-20 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <span className="text-white/40 text-sm italic whitespace-nowrap">
              개 생성 (최대 100)
            </span>
            <button
              onClick={() => onRandomGenerate(randomSize)}
              disabled={playing}
              className="ml-auto px-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 rounded-xl font-bold border border-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              무작위 생성
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
