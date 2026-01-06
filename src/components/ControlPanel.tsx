"use client";

import { useState, useEffect } from "react";

const SPEEDS = [0.25, 0.5, 0.75, 1, 2, 4, 8, 16];

export type AlgorithmCategory = "standard" | "linear" | "special";

export const ALGORITHMS = [
  // Standard
  {
    id: "bubble",
    name: "버블 정렬",
    category: "standard",
    desc: "인접한 두 항을 비교하며 정렬",
  },
  {
    id: "selection",
    name: "선택 정렬",
    category: "standard",
    desc: "최솟값을 찾아 앞으로 이동",
  },
  {
    id: "insertion",
    name: "삽입 정렬",
    category: "standard",
    desc: "정렬된 부분에 요소를 삽입",
  },
  {
    id: "quick",
    name: "퀵 정렬",
    category: "standard",
    desc: "피벗을 기준으로 분할 정렬",
  },
  {
    id: "merge",
    name: "병합 정렬",
    category: "standard",
    desc: "반으로 나누어 정렬 후 병합",
  },
  {
    id: "heap",
    name: "힙 정렬",
    category: "standard",
    desc: "힙 자료구조를 이용한 정렬",
  },
  {
    id: "shell",
    name: "셸 정렬",
    category: "standard",
    desc: "간격을 조절하며 삽입 정렬",
  },

  // Linear
  {
    id: "counting",
    name: "계수 정렬",
    category: "linear",
    desc: "값의 개수를 세서 정렬",
  },
  {
    id: "radix",
    name: "기수 정렬",
    category: "linear",
    desc: "자릿수 별로 정렬",
  },
  {
    id: "bucket",
    name: "버킷 정렬",
    category: "linear",
    desc: "범위별 버킷에 담아 정렬",
  },

  // Special
  {
    id: "tim",
    name: "팀 정렬",
    category: "special",
    desc: "삽입 + 병합 하이브리드",
  },
  {
    id: "comb",
    name: "콤 정렬",
    category: "special",
    desc: "간격을 둔 버블 정렬 개선판",
  },
  {
    id: "cocktail",
    name: "칵테일 정렬",
    category: "special",
    desc: "양방향 버블 정렬",
  },
  {
    id: "gnome",
    name: "그놈 정렬",
    category: "special",
    desc: "잘못된 위치면 뒤로 가며 정렬",
  },
  {
    id: "oddEven",
    name: "오드-이븐 정렬",
    category: "special",
    desc: "홀수/짝수 위치 교차 정렬",
  },
  {
    id: "pancake",
    name: "팬케이크 정렬",
    category: "special",
    desc: "뒤집기를 이용한 정렬",
  },
  {
    id: "bitonic",
    name: "비토닉 정렬",
    category: "special",
    desc: "병렬 처리에 적합한 수열 정렬",
  },
  {
    id: "bogo",
    name: "보고 정렬",
    category: "special",
    desc: "운이 좋을 때까지 무작위 섞기",
  },
  {
    id: "intro",
    name: "인트로 정렬",
    category: "special",
    desc: "퀵 + 힙 + 삽입 하이브리드",
  },
  {
    id: "tree",
    name: "트리 정렬",
    category: "special",
    desc: "이진 검색 트리를 이용한 정렬",
  },
] as const;

export type AlgorithmId = (typeof ALGORITHMS)[number]["id"];
export type GenerationMode = "random" | "unique";

type Props = {
  onStart: () => void;
  onReset: () => void;
  onStop: () => void;
  onCustomArray: (arr: number[]) => void;
  onRandomGenerate: (size: number, mode: GenerationMode) => void;
  playing: boolean;
  speedMultiplier: number;
  setSpeedMultiplier: (speed: number) => void;
  selectedAlgo: AlgorithmId;
  setSelectedAlgo: (id: AlgorithmId) => void;
  shellGaps: string;
  setShellGaps: (val: string) => void;
  bucketCount: number;
  setBucketCount: (val: number) => void;
  arrayLength: number;
};

const CATEGORIES = [
  { id: "standard", name: "기본 정렬" },
  { id: "linear", name: "고급 정렬" },
  { id: "special", name: "특이한 정렬" },
] as const;

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
  shellGaps,
  setShellGaps,
  bucketCount,
  setBucketCount,
  arrayLength,
}: Props) {
  const [customInput, setCustomInput] = useState("");
  const [randomSize, setRandomSize] = useState(arrayLength);
  const [genMode, setGenMode] = useState<GenerationMode>("unique");
  const [activeCategory, setActiveCategory] =
    useState<AlgorithmCategory>("standard");

  // Sync randomSize input with actual array length (from URL/State)
  useEffect(() => {
    setRandomSize(arrayLength);
  }, [arrayLength]);

  // Adjust activeCategory when selectedAlgo changes from parent/URL
  const [prevSelectedAlgo, setPrevSelectedAlgo] = useState(selectedAlgo);
  if (selectedAlgo !== prevSelectedAlgo) {
    setPrevSelectedAlgo(selectedAlgo);
    const algo = ALGORITHMS.find((a) => a.id === selectedAlgo);
    if (algo) {
      setActiveCategory(algo.category as AlgorithmCategory);
    }
  }

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

  const isStartDisabled = playing || arrayLength < 2;

  return (
    <div className="flex flex-col gap-6 mt-8 w-full max-w-4xl">
      {/* Category Selection */}
      <div className="flex gap-2 p-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 w-full md:w-fit self-center overflow-x-auto no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as AlgorithmCategory)}
            className={`
              px-4 md:px-6 py-2 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap flex-1 md:flex-none
              ${
                activeCategory === cat.id
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              }
            `}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Algorithm Selection Gradient Backdrop */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-1.5 md:gap-2 bg-white/5 backdrop-blur-md p-2 md:p-4 rounded-3xl border border-white/10 shadow-xl min-h-[160px]">
        {ALGORITHMS.filter((a) => a.category === activeCategory).map((algo) => (
          <button
            key={algo.id}
            onClick={() => setSelectedAlgo(algo.id)}
            disabled={playing}
            className={`
              px-2 py-3 md:px-3 md:py-4 rounded-xl text-[11px] md:text-sm font-bold transition-all border flex flex-col items-center justify-center gap-0.5 md:gap-1
              ${
                selectedAlgo === algo.id
                  ? "bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.2)]"
                  : "bg-white/5 border-white/10 text-white/40 hover:text-white/60 hover:bg-white/10"
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <span className="text-center leading-tight">{algo.name}</span>
            <span className="text-[8px] md:text-[9px] opacity-40 font-normal text-center leading-tight hidden xs:block">
              {algo.desc.split(" ").slice(0, 2).join(" ")}
            </span>
          </button>
        ))}
      </div>

      {/* Specific Algorithm Parameters */}
      {(selectedAlgo === "shell" || selectedAlgo === "bucket") && (
        <div className="bg-white/5 backdrop-blur-md p-4 md:p-6 rounded-3xl border border-white/10 shadow-xl flex flex-col gap-4">
          <span className="text-[10px] md:text-xs font-bold text-white/40 px-1 uppercase tracking-wider">
            {selectedAlgo === "shell" ? "Shell Sort Gaps" : "Bucket Sort Count"}
          </span>
          {selectedAlgo === "shell" ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={shellGaps}
                onChange={(e) => setShellGaps(e.target.value)}
                placeholder="예: 701, 301, 132, 57, 23, 10, 4, 1"
                disabled={playing}
                className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-colors text-xs md:text-sm"
              />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="20"
                value={bucketCount}
                onChange={(e) => setBucketCount(parseInt(e.target.value))}
                disabled={playing}
                className="flex-1 accent-indigo-500"
              />
              <span className="text-white font-mono bg-black/20 px-3 py-1 rounded-lg border border-white/10 text-xs">
                {bucketCount} Buckets
              </span>
            </div>
          )}
        </div>
      )}

      {/* Primary Actions & Speed */}
      <div className="flex flex-col md:flex-row items-center gap-6 bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-xl px-8">
        <div className="flex gap-3 w-full md:w-auto">
          {!playing ? (
            <button
              onClick={onStart}
              disabled={isStartDisabled}
              className={`flex-1 md:flex-none px-10 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all duration-200 shadow-[0_0_20px_rgba(79,70,229,0.4)] active:scale-95 disabled:opacity-50 disabled:shadow-none min-w-[140px]`}
            >
              정렬 시작
            </button>
          ) : (
            <button
              onClick={onStop}
              className="flex-1 md:flex-none px-10 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-all duration-200 shadow-[0_0_20px_rgba(225,29,72,0.4)] active:scale-95 min-w-[140px]"
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
          <span className="text-[10px] md:text-xs font-bold text-white/40 px-1 uppercase tracking-wider">
            Speed
          </span>
          <div className="flex gap-1 bg-black/20 p-1 rounded-lg overflow-x-auto no-scrollbar">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => setSpeedMultiplier(s)}
                className={`
                  px-2.5 md:px-3 py-1.5 rounded-md text-[10px] md:text-xs font-bold transition-all flex-1 md:flex-none
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
              className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
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
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={randomSize}
                onChange={(e) =>
                  setRandomSize(
                    Math.min(1000, Math.max(0, parseInt(e.target.value) || 0))
                  )
                }
                disabled={playing}
                className="w-24 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <span className="text-white/40 text-sm italic whitespace-nowrap">
                개 생성 (최대 1000)
              </span>
            </div>

            <div className="flex gap-2 p-1 bg-black/20 rounded-xl w-fit">
              <button
                onClick={() => setGenMode("unique")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  genMode === "unique"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                중복 없음 (순열)
              </button>
              <button
                onClick={() => setGenMode("random")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  genMode === "random"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                중복 있음 (완전 랜덤)
              </button>
            </div>

            <button
              onClick={() => onRandomGenerate(randomSize, genMode)}
              disabled={playing}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all duration-200 shadow-[0_0_20px_rgba(147,51,234,0.3)] active:scale-95 disabled:opacity-50"
            >
              무작위 생성 실행
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
