"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ArrayBars from "./ArrayBars";
import ControlPanel, {
  ALGORITHMS,
  AlgorithmId,
  GenerationMode,
} from "./ControlPanel";
import { SortStep, ArrayItem } from "@/types/sort";

// Algorithms
import { bubbleSortSteps } from "@/algorithms/bubbleSort";
import { selectionSortSteps } from "@/algorithms/selectionSort";
import { insertionSortSteps } from "@/algorithms/insertionSort";
import { quickSortSteps } from "@/algorithms/quickSort";
import { mergeSortSteps } from "@/algorithms/mergeSort";
import { heapSortSteps } from "@/algorithms/heapSort";
import { countingSortSteps } from "@/algorithms/countingSort";
import { radixSortSteps } from "@/algorithms/radixSort";
import { bucketSortSteps } from "@/algorithms/bucketSort";
import { shellSortSteps } from "@/algorithms/shellSort";

// New Special Algorithms
import { timSortSteps } from "@/algorithms/timSort";
import { combSortSteps } from "@/algorithms/combSort";
import { cocktailSortSteps } from "@/algorithms/cocktailSort";
import { gnomeSortSteps } from "@/algorithms/gnomeSort";
import { oddEvenSortSteps } from "@/algorithms/oddEvenSort";
import { pancakeSortSteps } from "@/algorithms/pancakeSort";
import { bitonicSortSteps } from "@/algorithms/bitonicSort";
import { bogoSortSteps } from "@/algorithms/bogoSort";
import { introSortSteps } from "@/algorithms/introSort";
import { treeSortSteps } from "@/algorithms/treeSort";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

const BASE_ANIMATION_SPEED = 100;

import { ALGO_CODE } from "@/data/algoCode";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";

export default function SortVisualizer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Use a ref for idCounter, initialized to null to satisfy purity checks
  const idCounter = useRef<number>(0);

  // Set initial idCounter on mount to avoid impurity during render
  useEffect(() => {
    idCounter.current = Date.now();
  }, []);

  const generateArrayItems = (
    size: number,
    mode: GenerationMode
  ): ArrayItem[] => {
    if (mode === "unique") {
      const nums = Array.from({ length: size }, (_, i) => i + 1);
      for (let i = nums.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [nums[i], nums[j]] = [nums[j], nums[i]];
      }
      return nums.map((val) => ({ id: idCounter.current++, value: val }));
    } else {
      return Array.from({ length: size }, () => ({
        id: idCounter.current++,
        value: Math.floor(Math.random() * (size * 1.5)) + 1,
      }));
    }
  };

  const [array, setArray] = useState<ArrayItem[]>([]);
  const [steps, setSteps] = useState<SortStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [selectedAlgo, setSelectedAlgo] = useState<AlgorithmId>("bubble");
  const [selectedAlgo2, setSelectedAlgo2] = useState<AlgorithmId>("quick");
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [isSortedFeedback, setIsSortedFeedback] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [executionTime2, setExecutionTime2] = useState<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const [array2, setArray2] = useState<ArrayItem[]>([]);
  const [steps2, setSteps2] = useState<SortStep[]>([]);
  const [stepIndex2, setStepIndex2] = useState(0);

  const [shellGaps, setShellGaps] = useState("");
  const [bucketCount, setBucketCount] = useState(5);

  // 1. Sync state from URL and enforce defaults
  useEffect(() => {
    const algoParam = searchParams.get("algo");
    const algo2Param = searchParams.get("algo2");
    const compareParam = searchParams.get("compare");
    const speedParam = searchParams.get("speed");
    const sizeParam = searchParams.get("size");

    // If any fundamental param is missing, redirect to a URL that has all defaults
    if (!algoParam || !speedParam || !sizeParam) {
      const params = new URLSearchParams(searchParams.toString());
      if (!params.has("algo")) params.set("algo", "bubble");
      if (!params.has("speed")) params.set("speed", "1");
      if (!params.has("size")) params.set("size", "20");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      return;
    }

    // sync compare mode
    if (compareParam === "true" && !isCompareMode) setIsCompareMode(true);
    if (compareParam === "false" && isCompareMode) setIsCompareMode(false);

    // sync algo
    const algoFromUrl = algoParam as AlgorithmId;
    if (ALGORITHMS.some((a) => a.id === algoFromUrl)) {
      if (algoFromUrl !== selectedAlgo) setSelectedAlgo(algoFromUrl);
    }

    // sync algo2
    if (algo2Param) {
      const algo2FromUrl = algo2Param as AlgorithmId;
      if (ALGORITHMS.some((a) => a.id === algo2FromUrl)) {
        if (algo2FromUrl !== selectedAlgo2) setSelectedAlgo2(algo2FromUrl);
      }
    }

    // sync speed
    const speedParsed = parseFloat(speedParam);
    if (!isNaN(speedParsed)) {
      const clampedSpeed = Math.min(16, Math.max(0.25, speedParsed));
      if (clampedSpeed !== speedMultiplier) setSpeedMultiplier(clampedSpeed);
    }

    // sync size
    const sizeParsed = parseInt(sizeParam);
    if (!isNaN(sizeParsed)) {
      const clampedSize = Math.min(1000, Math.max(2, sizeParsed));
      if (clampedSize !== array.length || array.length === 0) {
        setArray(generateArrayItems(clampedSize, "unique"));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // 2. Helper to update URL only when state changes from user UI actions
  const updateUrlParams = (
    updates: Record<string, string | number | boolean>
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    let changed = false;
    Object.entries(updates).forEach(([key, val]) => {
      if (params.get(key) !== val.toString()) {
        params.set(key, val.toString());
        changed = true;
      }
    });
    if (changed) {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  useEffect(() => {
    if (!playing) return;

    const finished1 = steps.length > 0 && stepIndex >= steps.length;
    const finished2 = isCompareMode
      ? steps2.length > 0 && stepIndex2 >= steps2.length
      : true;

    if (finished1 && finished2) {
      setPlaying(false);
      startTimeRef.current = null;
      return;
    }

    const timer = setTimeout(() => {
      // Advance algorithm 1
      if (stepIndex < steps.length) {
        const step = steps[stepIndex];
        setArray(step.array);
        setStepIndex((prev) => {
          const next = prev + 1;
          if (next >= steps.length && startTimeRef.current) {
            setExecutionTime(performance.now() - startTimeRef.current);
          }
          return next;
        });
      }

      // Advance algorithm 2
      if (isCompareMode && stepIndex2 < steps2.length) {
        const step = steps2[stepIndex2];
        setArray2(step.array);
        setStepIndex2((prev) => {
          const next = prev + 1;
          if (next >= steps2.length && startTimeRef.current) {
            setExecutionTime2(performance.now() - startTimeRef.current);
          }
          return next;
        });
      }
    }, BASE_ANIMATION_SPEED / speedMultiplier);

    return () => clearTimeout(timer);
  }, [
    playing,
    stepIndex,
    stepIndex2,
    steps,
    steps2,
    speedMultiplier,
    isCompareMode,
  ]);

  const isSorted = useMemo(() => {
    for (let i = 0; i < array.length - 1; i++) {
      if (array[i].value > array[i + 1].value) return false;
    }
    return array.length > 0;
  }, [array]);

  const getSteps = (id: AlgorithmId, arr: ArrayItem[]): SortStep[] => {
    switch (id) {
      case "bubble":
        return bubbleSortSteps(arr);
      case "selection":
        return selectionSortSteps(arr);
      case "insertion":
        return insertionSortSteps(arr);
      case "quick":
        return quickSortSteps(arr);
      case "merge":
        return mergeSortSteps(arr);
      case "heap":
        return heapSortSteps(arr);
      case "counting":
        return countingSortSteps(arr);
      case "radix":
        return radixSortSteps(arr);
      case "bucket":
        return bucketSortSteps(arr, bucketCount);
      case "shell": {
        const gaps = shellGaps
          .split(/[, \s]+/)
          .map((v) => parseInt(v.trim()))
          .filter((v) => !isNaN(v));
        return shellSortSteps(arr, gaps);
      }

      // Special
      case "tim":
        return timSortSteps(arr);
      case "comb":
        return combSortSteps(arr);
      case "cocktail":
        return cocktailSortSteps(arr);
      case "gnome":
        return gnomeSortSteps(arr);
      case "oddEven":
        return oddEvenSortSteps(arr);
      case "pancake":
        return pancakeSortSteps(arr);
      case "bitonic":
        return bitonicSortSteps(arr);
      case "bogo":
        return bogoSortSteps(arr);
      case "intro":
        return introSortSteps(arr);
      case "tree":
        return treeSortSteps(arr);

      default:
        return [];
    }
  };

  const start = () => {
    if (playing) return;

    if (isSorted) {
      setIsSortedFeedback(true);
      setTimeout(() => setIsSortedFeedback(false), 2000);
      return;
    }

    const s = getSteps(selectedAlgo, array);
    setSteps(s);
    setStepIndex(0);
    setExecutionTime(null);

    let s2: SortStep[] = [];
    if (isCompareMode) {
      s2 = getSteps(selectedAlgo2, array);
      setSteps2(s2);
      setStepIndex2(0);
      setArray2([...array]);
      setExecutionTime2(null);
    }

    startTimeRef.current = performance.now();
    setPlaying(true);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 0);
  };

  const stop = () => {
    setPlaying(false);
    setSteps([]);
    setStepIndex(0);
    setSteps2([]);
    setStepIndex2(0);
    startTimeRef.current = null;
  };

  const reset = () => {
    const newArray = generateArrayItems(array.length || 20, "unique");
    setArray(newArray);
    setSteps([]);
    setStepIndex(0);
    setExecutionTime(null);
    if (isCompareMode) {
      setArray2([...newArray]);
      setSteps2([]);
      setStepIndex2(0);
      setExecutionTime2(null);
    }
    setPlaying(false);
    startTimeRef.current = null;
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 0);
  };

  const handleCustomArray = (numbers: number[]) => {
    const newArr = numbers.map((val) => ({
      id: idCounter.current++,
      value: val,
    }));
    setArray(newArr);
    if (isCompareMode) setArray2([...newArr]);
    setSteps([]);
    setStepIndex(0);
    setSteps2([]);
    setStepIndex2(0);
    setPlaying(false);
    setExecutionTime(null);
    setExecutionTime2(null);
    updateUrlParams({ size: numbers.length });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRandomGenerate = (size: number, mode: GenerationMode) => {
    const newArr = generateArrayItems(size, mode);
    setArray(newArr);
    if (isCompareMode) setArray2([...newArr]);
    setSteps([]);
    setStepIndex(0);
    setSteps2([]);
    setStepIndex2(0);
    setPlaying(false);
    setExecutionTime(null);
    setExecutionTime2(null);
    updateUrlParams({ size });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const algoInfo = ALGORITHMS.find((a) => a.id === selectedAlgo);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl">
      <div className="text-center relative px-2 w-full mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 mb-3 md:mb-4 tracking-tight">
          Sorting Visualizer
        </h1>
        <div className="flex flex-col items-center gap-1 md:gap-2 text-center">
          <p className="text-white font-bold text-lg md:text-xl">
            {algoInfo?.name}
          </p>
          <p className="text-indigo-200/50 font-medium text-xs md:text-base px-4">
            {algoInfo?.desc}
          </p>
        </div>

        {isSortedFeedback && (
          <div className="absolute top-[-30px] md:top-[-40px] left-1/2 -translate-x-1/2 bg-emerald-500/20 text-emerald-400 px-3 py-1.5 md:px-4 md:py-2 rounded-xl border border-emerald-500/30 text-xs md:text-sm font-bold animate-bounce shadow-lg backdrop-blur-md z-20">
            이미 정렬 완료된 상태입니다!
          </div>
        )}
      </div>

      {/* Mobile Sticky Status Bar */}
      <div className="md:hidden sticky top-4 z-40 w-full mb-6 px-2 pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl flex items-center justify-between pointer-events-auto">
          <div className="flex flex-col">
            <span className="text-[10px] text-white/40 font-mono uppercase">
              {selectedAlgo}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-indigo-400 font-bold">
                {stepIndex} / {steps.length} steps
              </span>
              {executionTime !== null && (
                <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {(executionTime / 1000).toFixed(2)}s
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {!playing ? (
              <button
                onClick={start}
                className="w-8 h-8 flex items-center justify-center bg-indigo-600 rounded-lg text-white"
              >
                ▶
              </button>
            ) : (
              <button
                onClick={stop}
                className="w-8 h-8 flex items-center justify-center bg-rose-600 rounded-lg text-white"
              >
                ■
              </button>
            )}
            <button
              onClick={reset}
              className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg text-white"
            >
              ↺
            </button>
          </div>
        </div>
      </div>

      {/* Unified Single-Line Status Bar */}
      <div className="w-full max-w-4xl mb-6 px-2">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-full px-3 py-2 md:px-6 md:py-2.5 shadow-2xl flex items-center justify-between gap-1 md:gap-4">
          {/* Group 1: Steps & Size */}
          <div className="flex items-center gap-2 md:gap-6 bg-white/5 md:bg-transparent px-2 py-1 md:p-0 rounded-xl border border-white/5 md:border-none">
            <div className="flex items-center gap-1.5 md:gap-2">
              <span className="text-[8px] md:text-xs font-bold text-white/30 uppercase tracking-tighter">
                Steps
              </span>
              <span className="text-[10px] md:text-sm text-indigo-400 font-mono font-black">
                {isCompareMode ? `${stepIndex} / ${stepIndex2}` : stepIndex}
              </span>
            </div>

            <div className="h-3 w-px bg-white/10"></div>

            <div className="flex items-center gap-1.5 md:gap-2">
              <span className="text-[8px] md:text-xs font-bold text-white/30 uppercase tracking-tighter">
                Size
              </span>
              <span className="text-[10px] md:text-sm text-purple-400 font-mono font-black">
                {array.length}
              </span>
            </div>
          </div>

          <div className="hidden sm:block h-6 w-px bg-white/10 mx-1 md:mx-2"></div>

          {/* Group 2: Algorithm & Time */}
          <div className="flex items-center gap-2 md:gap-6 flex-1 justify-end">
            <div className="flex items-center gap-1.5 md:gap-3 px-2 py-1 md:p-0 bg-pink-500/5 md:bg-transparent rounded-xl border border-pink-500/10 md:border-none">
              <span className="text-[8px] md:text-xs font-bold text-white/30 uppercase tracking-tighter hidden md:inline">
                Algo
              </span>
              <span className="text-[9px] md:text-sm uppercase-algo text-pink-400 font-black tracking-tight truncate max-w-[60px] md:max-w-none">
                {isCompareMode
                  ? `${selectedAlgo} vs ${selectedAlgo2}`
                  : selectedAlgo}
              </span>
            </div>

            <div className="h-3 md:h-6 w-px bg-white/10"></div>

            <div
              className={`flex items-center gap-1.5 md:gap-2 bg-amber-500/10 px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-full border border-amber-500/20 ${
                executionTime === null && executionTime2 === null
                  ? "opacity-20"
                  : ""
              }`}
            >
              <span className="text-[8px] md:text-xs font-bold text-amber-500/40 uppercase hidden sm:inline">
                Time
              </span>
              <span className="text-[10px] md:text-sm text-amber-400 font-mono font-black">
                {isCompareMode
                  ? `${
                      executionTime !== null
                        ? (executionTime / 1000).toFixed(2)
                        : "---"
                    }s / ${
                      executionTime2 !== null
                        ? (executionTime2 / 1000).toFixed(2)
                        : "---"
                    }s`
                  : executionTime !== null
                  ? `${(executionTime / 1000).toFixed(2)}s`
                  : "0.0s"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`w-full flex ${
          isCompareMode ? "flex-col md:flex-row gap-8" : "flex-col"
        } items-center`}
      >
        <div className="flex-1 w-full flex flex-col items-center">
          {isCompareMode && (
            <span className="text-xs font-bold text-white/20 mb-2 uppercase tracking-widest">
              Algorithm 1: {selectedAlgo}
            </span>
          )}
          <ArrayBars
            array={array}
            compare={steps[stepIndex]?.compare}
            swap={steps[stepIndex]?.swap}
          />
        </div>

        {isCompareMode && (
          <div className="flex-1 w-full flex flex-col items-center">
            <span className="text-xs font-bold text-white/20 mb-2 uppercase tracking-widest">
              Algorithm 2: {selectedAlgo2}
            </span>
            <ArrayBars
              array={array2}
              compare={steps2[stepIndex2]?.compare}
              swap={steps2[stepIndex2]?.swap}
            />
          </div>
        )}
      </div>

      <ControlPanel
        onStart={start}
        onReset={reset}
        onStop={stop}
        onCustomArray={handleCustomArray}
        onRandomGenerate={handleRandomGenerate}
        playing={playing}
        speedMultiplier={speedMultiplier}
        setSpeedMultiplier={(s) => {
          setSpeedMultiplier(s);
          updateUrlParams({ speed: s });
        }}
        selectedAlgo={selectedAlgo}
        setSelectedAlgo={(id) => {
          setSelectedAlgo(id);
          updateUrlParams({ algo: id });
        }}
        selectedAlgo2={selectedAlgo2}
        setSelectedAlgo2={(id) => {
          setSelectedAlgo2(id);
          updateUrlParams({ algo2: id });
        }}
        isCompareMode={isCompareMode}
        setIsCompareMode={(val) => {
          setIsCompareMode(val);
          updateUrlParams({ compare: val });
        }}
        shellGaps={shellGaps}
        setShellGaps={setShellGaps}
        bucketCount={bucketCount}
        setBucketCount={setBucketCount}
        arrayLength={array.length}
      />

      <div className="mt-8 flex flex-col md:flex-row items-center justify-end w-full max-w-4xl px-2 md:px-0 gap-4">
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowCode(!showCode)}
            className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl border text-xs md:text-sm font-bold transition-all shadow-sm active:scale-95 whitespace-nowrap ${
              showCode
                ? "bg-indigo-600 border-indigo-500 text-white"
                : "text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border-white/10"
            }`}
          >
            {showCode ? "코드 닫기" : "구현 코드 보기"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showCode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full max-w-4xl mt-8 overflow-hidden"
          >
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="ml-2 text-xs font-mono text-white/30 uppercase tracking-widest">
                    {selectedAlgo}.js
                  </span>
                </div>
                <div className="text-[10px] text-indigo-400 font-bold px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                  {algoInfo?.name} 구현 코드
                </div>
              </div>

              <div className="relative group">
                <pre className="text-sm md:text-base font-mono leading-relaxed overflow-x-auto custom-scrollbar p-1">
                  <code
                    className="language-javascript"
                    dangerouslySetInnerHTML={{
                      __html: Prism.highlight(
                        ALGO_CODE[selectedAlgo],
                        Prism.languages.javascript,
                        "javascript"
                      )
                        .split("\n")
                        .map(
                          (line, i) =>
                            `<div class="flex gap-6"><span class="w-8 text-right text-white/10 select-none shrink-0">${
                              i + 1
                            }</span><span>${line}</span></div>`
                        )
                        .join(""),
                    }}
                  />
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
