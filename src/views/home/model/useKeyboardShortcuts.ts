"use client";

import { useEffect, useEffectEvent } from "react";
import { resolveShortcut, type ShortcutAction } from "./shortcutKey";

type Handlers = {
  onToggle: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onShuffle: () => void;
  onToggleSound: () => void;
};

const HANDLER_OF: Record<ShortcutAction, keyof Handlers> = {
  toggle: "onToggle",
  stepForward: "onStepForward",
  stepBackward: "onStepBackward",
  shuffle: "onShuffle",
  toggleSound: "onToggleSound",
};

/** Space: 재생/일시정지, ←/→: 한 단계, R: 새 배열, M: 소리 켜기/끄기 (요소별 예외는 resolveShortcut) */
export function useKeyboardShortcuts(handlers: Handlers) {
  const onKeyDown = useEffectEvent((e: KeyboardEvent) => {
    const target = e.target instanceof HTMLElement ? e.target : null;
    const decision = resolveShortcut({
      key: e.key,
      tagName: target?.tagName ?? null,
      inputType: target instanceof HTMLInputElement ? target.type : null,
      isContentEditable: target?.isContentEditable ?? false,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
      altKey: e.altKey,
    });
    if (!decision) return;
    if (decision.preventDefault) e.preventDefault();
    handlers[HANDLER_OF[decision.action]]();
  });

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
