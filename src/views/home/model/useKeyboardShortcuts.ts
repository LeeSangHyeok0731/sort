"use client";

import { useEffect, useEffectEvent } from "react";

type Handlers = {
  onToggle: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onShuffle: () => void;
  onToggleSound: () => void;
};

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

/** Space: 재생/일시정지, ←/→: 한 단계, R: 새 배열, M: 소리 켜기/끄기 */
export function useKeyboardShortcuts(handlers: Handlers) {
  const onKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey || isTypingTarget(e.target)) return;
    // 버튼에 포커스가 있을 때 Space는 버튼 클릭과 겹치므로 기본 동작을 막는다
    switch (e.key) {
      case " ":
        e.preventDefault();
        handlers.onToggle();
        break;
      case "ArrowRight":
        e.preventDefault();
        handlers.onStepForward();
        break;
      case "ArrowLeft":
        e.preventDefault();
        handlers.onStepBackward();
        break;
      case "r":
      case "R":
        handlers.onShuffle();
        break;
      case "m":
      case "M":
        handlers.onToggleSound();
        break;
    }
  });

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
