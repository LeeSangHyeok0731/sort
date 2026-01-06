"use client";

import { motion } from "framer-motion";
import { ArrayItem } from "@/types/sort";

type Props = {
  array: ArrayItem[];
  compare?: [number, number];
  swap?: [number, number];
  isExpanded?: boolean;
};

export default function ArrayBars({ array, compare, swap, isExpanded }: Props) {
  const maxValue = Math.max(...array.map((i) => i.value), 1);
  const isLargeDataset = array.length > 100;
  const isVeryLargeDataset = array.length > 500;

  return (
    <div
      className={`
        flex items-end transition-all duration-500 ease-in-out
        ${
          array.length > 200 ? "gap-0" : array.length > 50 ? "gap-px" : "gap-1"
        } 
        ${isExpanded ? "h-[60vh]" : "h-80"} 
        w-full bg-white/5 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/10 shadow-2xl relative overflow-hidden
      `}
    >
      {array.map((item, index) => {
        const isCompare = compare?.includes(index);
        const isSwap = swap?.includes(index);

        return (
          <motion.div
            key={item.id}
            layout={!isLargeDataset}
            transition={
              isLargeDataset
                ? { duration: 0 }
                : {
                    type: "spring",
                    stiffness: 400,
                    damping: 40,
                  }
            }
            className={`
              flex-1 ${
                isVeryLargeDataset ? "rounded-none" : "rounded-t-lg"
              } transition-colors duration-150 ease-out
              ${
                isSwap
                  ? "bg-linear-to-t from-emerald-500 to-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)] z-10"
                  : isCompare
                  ? "bg-linear-to-t from-rose-500 to-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.5)] z-10"
                  : "bg-linear-to-t from-indigo-600 to-indigo-400"
              }
            `}
            style={{
              height: `${(item.value / maxValue) * 100}%`,
              opacity: isCompare || isSwap ? 1 : 0.8,
            }}
          />
        );
      })}
    </div>
  );
}
