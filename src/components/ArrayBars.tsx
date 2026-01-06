"use client";

import { motion } from "framer-motion";
import { ArrayItem } from "@/types/sort";

type Props = {
  array: ArrayItem[];
  compare?: [number, number];
  swap?: [number, number];
};

export default function ArrayBars({ array, compare, swap }: Props) {
  const maxValue = Math.max(...array.map((i) => i.value));

  return (
    <div className="flex items-end gap-1 h-80 w-full bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-2xl relative overflow-hidden">
      {array.map((item, index) => {
        const isCompare = compare?.includes(index);
        const isSwap = swap?.includes(index);

        return (
          <motion.div
            key={item.id}
            layout
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 40,
            }}
            className={`
              flex-1 rounded-t-lg transition-colors duration-150 ease-out
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
