"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ArrayBars from "./ArrayBars";
import ControlPanel, { ALGORITHMS, AlgorithmId } from "./ControlPanel";
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

const BASE_ANIMATION_SPEED = 100;

export default function SortVisualizer() {
  const idCounter = useRef(Date.now());

  const generateRandomArray = (size: number): ArrayItem[] =>
    Array.from({ length: size }, () => ({
      id: idCounter.current++,
      value: Math.floor(Math.random() * 90) + 10,
    }));

  const [array, setArray] = useState<ArrayItem[]>([]);
  const [steps, setSteps] = useState<SortStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [selectedAlgo, setSelectedAlgo] = useState<AlgorithmId>("bubble");
  const [isSortedFeedback, setIsSortedFeedback] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Algorithm specific parameters
  const [shellGaps, setShellGaps] = useState("");
  const [bucketCount, setBucketCount] = useState(5);

  useEffect(() => {
    if (array.length === 0) {
      setArray(generateRandomArray(20));
    }
  }, []);

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
    const newArray = generateRandomArray(array.length || 20);
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

  const handleRandomGenerate = (size: number) => {
    setArray(generateRandomArray(size));
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
        className={`text-center relative px-4 ${isExpanded ? "mb-8" : "mb-12"}`}
      >
        <h1
          className={`${
            isExpanded ? "text-4xl" : "text-5xl"
          } font-extrabold bg-clip-text text-transparent bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 mb-4 tracking-tight`}
        >
          Sorting Visualizer
        </h1>
        <div className="flex flex-col items-center gap-2">
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
      />

      <div className="mt-8 flex items-center justify-between w-full max-w-2xl px-4 md:px-0">
        <div className="text-white/40 text-[10px] md:text-sm font-mono bg-black/20 px-4 md:px-6 py-2.5 rounded-full border border-white/10 shadow-inner flex gap-2 md:gap-4 overflow-hidden">
          <span className="truncate">
            Steps: <span className="text-indigo-400">{stepIndex}</span> /{" "}
            {steps.length}
          </span>
          <span className="text-white/10">|</span>
          <span className="truncate">
            Size: <span className="text-purple-400">{array.length}</span>
          </span>
          <span className="text-white/10">|</span>
          <span className="truncate uppercase-algo text-pink-400 font-bold">
            {selectedAlgo}
          </span>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-white/60 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/10 text-sm font-bold transition-all shadow-sm active:scale-95 whitespace-nowrap"
        >
          {isExpanded ? "축소하기" : "확대해서 보기"}
        </button>
      </div>
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
            className="fixed inset-0 z-[100] bg-[#0f172a] p-4 md:p-10 flex flex-col items-center justify-center overflow-auto pointer-events-auto"
          >
            <div className="w-full h-full flex flex-col items-center py-10">
              {visualizerContent}
            </div>

            <button
              onClick={() => setIsExpanded(false)}
              className="fixed top-8 right-8 text-white/40 hover:text-white text-3xl font-light transition-all p-2 bg-white/5 rounded-full hover:bg-white/10 border border-white/10 z-[101]"
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
