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
  const [isSortedFeedback, setIsSortedFeedback] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const [shellGaps, setShellGaps] = useState("");
  const [bucketCount, setBucketCount] = useState(5);

  // 1. Sync state from URL (Handles initial load and browser back/forward navigation)
  useEffect(() => {
    const algoFromUrl = searchParams.get("algo") as AlgorithmId;
    if (
      algoFromUrl &&
      algoFromUrl !== selectedAlgo &&
      ALGORITHMS.some((a) => a.id === algoFromUrl)
    ) {
      setSelectedAlgo(algoFromUrl);
    }

    const speedFromUrl = searchParams.get("speed");
    if (speedFromUrl) {
      const speedParsed = parseFloat(speedFromUrl);
      if (!isNaN(speedParsed)) {
        // Clamp speed between 0.25 and 16 (matching SPEEDS constant)
        const clampedSpeed = Math.min(16, Math.max(0.25, speedParsed));
        if (clampedSpeed !== speedMultiplier) setSpeedMultiplier(clampedSpeed);
      }
    }

    const sizeFromUrl = searchParams.get("size");

    if (sizeFromUrl) {
      // Clamp size between 2 and 1000
      const sizeParsed = Math.min(1000, Math.max(2, parseInt(sizeFromUrl)));
      setArray(generateArrayItems(sizeParsed, "unique"));
    } else if (array.length === 0) {
      setArray(generateArrayItems(20, "unique"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // 2. Helper to update URL only when state changes from user UI actions
  const updateUrlParams = (updates: Record<string, string | number>) => {
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
    if (stepIndex >= steps.length) {
      setPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      const step = steps[stepIndex];
      if (step) {
        setArray(step.array);
        setStepIndex((i) => i + 1);
      } else if (stepIndex >= steps.length && steps.length > 0) {
        // Finishing sorting
        if (startTimeRef.current) {
          setExecutionTime(performance.now() - startTimeRef.current);
          startTimeRef.current = null;
        }
        setPlaying(false);
      }
    }, BASE_ANIMATION_SPEED / speedMultiplier);

    return () => clearTimeout(timer);
  }, [playing, stepIndex, steps, speedMultiplier]);

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
    startTimeRef.current = performance.now();
    setPlaying(true);
  };

  const stop = () => {
    setPlaying(false);
    setSteps([]);
    setStepIndex(0);
    startTimeRef.current = null;
  };

  const reset = () => {
    const newArray = generateArrayItems(array.length || 20, "unique");
    setArray(newArray);
    setSteps([]);
    setStepIndex(0);
    setPlaying(false);
    setExecutionTime(null);
    startTimeRef.current = null;
  };

  const handleCustomArray = (numbers: number[]) => {
    setArray(numbers.map((val) => ({ id: idCounter.current++, value: val })));
    setSteps([]);
    setStepIndex(0);
    setPlaying(false);
    setExecutionTime(null);
    updateUrlParams({ size: numbers.length });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRandomGenerate = (size: number, mode: GenerationMode) => {
    setArray(generateArrayItems(size, mode));
    setSteps([]);
    setStepIndex(0);
    setPlaying(false);
    setExecutionTime(null);
    updateUrlParams({ size });
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (size > 100) {
      setIsExpanded(true);
    }
  };

  const currentStep = steps[stepIndex];
  const algoInfo = ALGORITHMS.find((a) => a.id === selectedAlgo);

  const visualizerContent = (
    <div
      className={`flex flex-col items-center w-full ${
        isExpanded ? "max-w-7xl" : "max-w-4xl"
      }`}
    >
      <div
        className={`text-center relative px-2 w-full ${
          isExpanded ? "mb-6" : "mb-8 md:mb-12"
        }`}
      >
        <h1
          className={`${
            isExpanded ? "text-3xl md:text-4xl" : "text-3xl md:text-5xl"
          } font-extrabold bg-clip-text text-transparent bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 mb-3 md:mb-4 tracking-tight`}
        >
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
      <div className="md:hidden sticky top-4 z-40 w-full mb-4 px-2 pointer-events-none">
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

      <ArrayBars
        array={array}
        compare={currentStep?.compare}
        swap={currentStep?.swap}
        isExpanded={isExpanded}
      />

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
        shellGaps={shellGaps}
        setShellGaps={(v) => {
          setShellGaps(v);
          // Optional: gaps don't necessarily need to be in URL unless requested
        }}
        bucketCount={bucketCount}
        setBucketCount={(v) => {
          setBucketCount(v);
          updateUrlParams({ buckets: v });
        }}
        arrayLength={array.length}
      />

      <div className="mt-8 flex flex-col md:flex-row items-center justify-between w-full max-w-2xl px-2 md:px-0 gap-4">
        <div className="hidden md:flex text-white/40 text-sm font-mono bg-black/20 px-6 py-2.5 rounded-full border border-white/10 shadow-inner flex-wrap justify-center gap-4 overflow-hidden order-2 md:order-1 self-center md:self-auto items-center">
          <span className="whitespace-nowrap">
            Steps: <span className="text-indigo-400">{stepIndex}</span> /{" "}
            {steps.length}
          </span>
          <span className="text-white/10">|</span>
          <span className="whitespace-nowrap">
            Size: <span className="text-purple-400">{array.length}</span>
          </span>
          <span className="text-white/10">|</span>
          <span className="whitespace-nowrap uppercase-algo text-pink-400 font-bold">
            {selectedAlgo}
          </span>
          {executionTime !== null && (
            <>
              <span className="text-white/10">|</span>
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="whitespace-nowrap bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
              >
                Time:{" "}
                <span className="text-amber-400 font-bold shadow-amber-400/20 drop-shadow-sm">
                  {(executionTime / 1000).toFixed(2)}s
                </span>
              </motion.span>
            </>
          )}
        </div>

        <div className="flex gap-2 w-full md:w-auto order-1 md:order-2">
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
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 md:flex-none text-white/60 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-xs md:text-sm font-bold transition-all shadow-sm active:scale-95 whitespace-nowrap"
          >
            {isExpanded ? "축소하기" : "확대해서 보기"}
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

  return (
    <>
      {!isExpanded && visualizerContent}

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 bg-[#0f172a] p-4 md:p-10 flex flex-col items-center overflow-auto pointer-events-auto"
          >
            <div className="w-full flex flex-col items-center py-10 min-h-full">
              {visualizerContent}
            </div>

            <button
              onClick={() => setIsExpanded(false)}
              className="fixed top-8 right-8 text-white/40 hover:text-white text-3xl font-light transition-all p-2 bg-white/5 rounded-full hover:bg-white/10 border border-white/10 z-101"
              aria-label="Close Expanded View"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
