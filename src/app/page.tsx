import { HomePage } from "@/views/home";

export default function Page() {
  // px: 양옆 고정 사이드바(가장자리 12px + 너비 260px) + 간격 24px. 비교 모드와 상관없이 본문을 가운데에 둔다
  return (
    <main className="relative min-h-screen overflow-x-clip bg-background py-8 px-[296px] md:py-14">
      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <HomePage />
      </div>
    </main>
  );
}
