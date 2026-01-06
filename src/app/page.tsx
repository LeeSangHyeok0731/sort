import { Suspense } from "react";
import SortVisualizer from "@/components/SortVisualizer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f172a] flex flex-col items-center py-12 md:py-20 px-6 relative">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="z-10 w-full flex flex-col items-center">
        <Suspense
          fallback={
            <div className="text-white/20 text-center animate-pulse py-20">
              Loading Visualizer...
            </div>
          }
        >
          <SortVisualizer />
        </Suspense>
      </div>
    </main>
  );
}
