import { HomePage } from "@/views/home";

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-x-clip bg-background px-4 py-8 md:px-8 md:py-14">
      <div aria-hidden className="pointer-events-none fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
      <div aria-hidden className="pointer-events-none fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px]" />
      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <HomePage />
      </div>
    </main>
  );
}
