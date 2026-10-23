import { HomePage } from "@/views/home";

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-x-clip bg-background px-4 py-8 md:px-8 md:py-14">
      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <HomePage />
      </div>
    </main>
  );
}
