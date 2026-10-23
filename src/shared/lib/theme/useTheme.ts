"use client";

import { useSyncExternalStore } from "react";
import { readTheme, type Theme } from "./theme";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

/** 지금 테마. 서버 렌더와 첫 hydration에서는 "light"이고, 곧 실제 값으로 다시 그린다 */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, readTheme, () => "light");
}
