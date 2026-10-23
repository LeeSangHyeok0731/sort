import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { THEME_INIT_SCRIPT } from "@/shared/lib";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sort Algo",
  description: "정렬 알고리즘을 보다 재미있고 명확하게!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // data-theme은 아래 스크립트가 hydration 전에 정하므로 서버 HTML과 다를 수 있다
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
