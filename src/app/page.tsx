import { HomePage } from "@/views/home";

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-x-clip bg-background px-4 pt-8 pb-3 md:px-8 md:pt-14">
      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <HomePage />
      </div>
    </main>
  );
}
