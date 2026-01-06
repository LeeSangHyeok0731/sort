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

  const [shellGaps, setShellGaps] = useState("");
  const [bucketCount, setBucketCount] = useState(5);

  // Sync state with URL on mount
  useEffect(() => {
    const algoFromUrl = searchParams.get("algo") as AlgorithmId;
    if (algoFromUrl && ALGORITHMS.some((a) => a.id === algoFromUrl)) {
      setSelectedAlgo(algoFromUrl);
    }

    if (array.length === 0) {
      setArray(generateArrayItems(20, "unique"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync URL with state when algo changes
  useEffect(() => {
    const currentAlgo = searchParams.get("algo");
    if (currentAlgo !== selectedAlgo) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("algo", selectedAlgo);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [selectedAlgo, pathname, router, searchParams]);

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
    setPlaying(true);
  };

  const stop = () => {
    setPlaying(false);
    setSteps([]);
    setStepIndex(0);
  };

  const reset = () => {
    const newArray = generateArrayItems(array.length || 20, "unique");
    setArray(newArray);
    setSteps([]);
    setStepIndex(0);
    setPlaying(false);
  };

  const handleCustomArray = (numbers: number[]) => {
    setArray(numbers.map((val) => ({ id: idCounter.current++, value: val })));
    setSteps([]);
    setStepIndex(0);
    setPlaying(false);
  };

  const handleRandomGenerate = (size: number, mode: GenerationMode) => {
    setArray(generateArrayItems(size, mode));
    setSteps([]);
    setStepIndex(0);
    setPlaying(false);
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
        className={`text-center relative px-4 w-full ${
          isExpanded ? "mb-8" : "mb-12"
        }`}
      >
        <h1
          className={`${
            isExpanded ? "text-4xl" : "text-5xl"
          } font-extrabold bg-clip-text text-transparent bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 mb-4 tracking-tight`}
        >
          Sorting Visualizer
        </h1>
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-white font-bold text-xl">{algoInfo?.name}</p>
          <p className="text-indigo-200/50 font-medium">{algoInfo?.desc}</p>
        </div>

        {isSortedFeedback && (
          <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl border border-emerald-500/30 font-bold animate-bounce ink-shadow">
            이미 정렬 완료된 상태입니다!
          </div>
        )}
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
        setSpeedMultiplier={setSpeedMultiplier}
        selectedAlgo={selectedAlgo}
        setSelectedAlgo={setSelectedAlgo}
        shellGaps={shellGaps}
        setShellGaps={setShellGaps}
        bucketCount={bucketCount}
        setBucketCount={setBucketCount}
        arrayLength={array.length}
      />

      <div className="mt-8 flex flex-col md:flex-row items-center justify-between w-full max-w-2xl px-4 md:px-0 gap-4">
        <div className="text-white/40 text-[10px] md:text-sm font-mono bg-black/20 px-4 md:px-6 py-2.5 rounded-full border border-white/10 shadow-inner flex flex-wrap justify-center gap-2 md:gap-4 overflow-hidden order-2 md:order-1 self-center md:self-auto">
          <span className="whitespace-nowrap">
            Steps: <span className="text-indigo-400">{stepIndex}</span> /{" "}
            {steps.length}
          </span>
          <span className="text-white/10 hidden md:inline">|</span>
          <span className="whitespace-nowrap">
            Size: <span className="text-purple-400">{array.length}</span>
          </span>
          <span className="text-white/10 hidden md:inline">|</span>
          <span className="whitespace-nowrap uppercase-algo text-pink-400 font-bold">
            {selectedAlgo}
          </span>
        </div>

        <div className="flex gap-2 order-1 md:order-2">
          <button
            onClick={() => setShowCode(!showCode)}
            className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all shadow-sm active:scale-95 whitespace-nowrap ${
              showCode
                ? "bg-indigo-600 border-indigo-500 text-white"
                : "text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border-white/10"
            }`}
          >
            {showCode ? "코드 닫기" : "구현 코드 보기"}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white/60 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/10 text-sm font-bold transition-all shadow-sm active:scale-95 whitespace-nowrap"
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
