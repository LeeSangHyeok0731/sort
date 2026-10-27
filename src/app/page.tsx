import { HomePage } from "@/views/home";

export default function Page() {
  // pl: 고정 사이드바(left 12px + 너비 260px) + 간격 24px
  return (
    <main className="relative min-h-screen overflow-x-clip bg-background py-8 pr-8 pl-[296px] md:py-14">
      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <HomePage />
      </div>
    </main>
  );
}
