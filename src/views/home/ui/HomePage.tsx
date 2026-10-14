"use client";

import dynamic from "next/dynamic";

/**
 * 초기 배열이 난수와 URL에 의존하므로 서버 렌더링 없이 클라이언트에서만 그린다.
 * (서버/클라이언트 결과가 달라 생기는 하이드레이션 불일치를 원천 차단)
 */
const HomeView = dynamic(() => import("./HomeView"), {
  ssr: false,
  loading: () => (
    <div className="text-white/30 text-center animate-pulse py-32">Loading Visualizer...</div>
  ),
});

export default function HomePage() {
  return <HomeView />;
}
