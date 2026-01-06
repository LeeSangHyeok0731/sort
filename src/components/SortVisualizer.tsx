"use client";

import { useEffect, useState, useMemo, useRef } from "react";
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
  const [array, setArray] = useState<ArrayItem[]>([]);
  const [steps, setSteps] = useState<SortStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [selectedAlgo, setSelectedAlgo] = useState<AlgorithmId>("bubble");
  const [isSortedFeedback, setIsSortedFeedback] = useState(false);

  // Use a ref to track a globally unique ID for each bar
  const idCounter = useRef(0);

  const createArrayItems = (numbers: number[]): ArrayItem[] =>
    numbers.map((val) => ({
      id: idCounter.current++,
      value: val,
    }));

  const generateRandomArray = (size: number): ArrayItem[] =>
    Array.from({ length: size }, () => ({
      id: idCounter.current++,
      value: Math.floor(Math.random() * 90) + 10,
    }));

  // Initialize array on mount
  useEffect(() => {
    setArray(generateRandomArray(20));
  }, []);

  useEffect(() => {
    if (!playing) return;
    if (stepIndex >= steps.length) {
      setPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      const step = steps[stepIndex];
      setArray(step.array);
      setStepIndex((i) => i + 1);
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
        return bucketSortSteps(arr);
      case "shell":
        return shellSortSteps(arr);
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
    setArray(createArrayItems(numbers));
    setSteps([]);
    setStepIndex(0);
    setPlaying(false);
  };

  const handleRandomGenerate = (size: number) => {
    setArray(generateRandomArray(size));
    setSteps([]);
    setStepIndex(0);
    setPlaying(false);
  };

  const currentStep = steps[stepIndex];
  const algoInfo = ALGORITHMS.find((a) => a.id === selectedAlgo);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      <div className="mb-12 text-center relative px-4">
        <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 mb-4 tracking-tight">
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
      />

      <div className="mt-8 text-white/40 text-sm font-mono bg-black/20 px-6 py-2.5 rounded-full border border-white/10 shadow-inner flex gap-4">
        <span>
          Steps: <span className="text-indigo-400">{stepIndex}</span> /{" "}
          {steps.length}
        </span>
        <span className="text-white/10">|</span>
        <span>
          Size: <span className="text-purple-400">{array.length}</span>
        </span>
        <span className="text-white/10">|</span>
        <span>
          Algorithm:{" "}
          <span className="text-pink-400 uppercase">{selectedAlgo}</span>
        </span>
      </div>
    </div>
  );
}
