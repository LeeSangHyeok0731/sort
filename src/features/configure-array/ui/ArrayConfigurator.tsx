"use client";

import { useState } from "react";
import { cn } from "@/shared/lib";
import {
  MAX_ARRAY_SIZE,
  MAX_VALUE,
  MIN_ARRAY_SIZE,
  parseCustomValues,
  parseSize,
  PRESETS,
  type PresetId,
} from "@/entities/array";

type Props = {
  size: number;
  preset: PresetId | "custom";
  onGenerate: (size: number, preset: PresetId) => void;
  onCustom: (values: number[]) => void;
};

function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="text-xs text-red-600">
      {children}
    </p>
  );
}

export default function ArrayConfigurator({ size, preset, onGenerate, onCustom }: Props) {
  const [sizeText, setSizeText] = useState(String(size));
  const [sizeError, setSizeError] = useState<string | null>(null);
  const [customText, setCustomText] = useState("");
  const [customError, setCustomError] = useState<string | null>(null);

  // 외부(URL·커스텀 입력)에서 크기가 바뀌면 입력창도 맞춘다
  const [prevSize, setPrevSize] = useState(size);
  if (size !== prevSize) {
    setPrevSize(size);
    setSizeText(String(size));
    setSizeError(null);
  }

  const generate = (nextPreset: PresetId) => {
    const parsed = parseSize(sizeText);
    if (parsed === null || parsed < MIN_ARRAY_SIZE || parsed > MAX_ARRAY_SIZE) {
      setSizeError(`크기는 ${MIN_ARRAY_SIZE}~${MAX_ARRAY_SIZE} 사이의 정수로 입력해 주세요.`);
      return;
    }
    setSizeError(null);
    onGenerate(parsed, nextPreset);
  };

  const submitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const result = parseCustomValues(customText);
    if (!result.ok) {
      setCustomError(result.error);
      return;
    }
    setCustomError(null);
    setCustomText("");
    onCustom(result.values);
  };

  return (
    <section className="flex flex-col gap-5" aria-label="데이터 설정">
      <h2 className="text-foreground font-bold text-lg">데이터</h2>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <label htmlFor="array-size" className="text-sm text-muted shrink-0">
            크기
          </label>
          <input
            id="array-size"
            type="text"
            inputMode="numeric"
            value={sizeText}
            onChange={(e) => {
              setSizeText(e.target.value.replace(/\D/g, ""));
              setSizeError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && preset !== "custom") generate(preset);
            }}
            aria-invalid={sizeError !== null}
            className={cn(
              "w-24 bg-surface border rounded-lg px-3 py-2 text-sm font-mono text-foreground focus:outline-none",
              sizeError ? "border-red-500" : "border-line focus:border-foreground"
            )}
          />
          <span className="text-xs text-muted">
            {MIN_ARRAY_SIZE}~{MAX_ARRAY_SIZE}개
          </span>
        </div>
        {sizeError && <ErrorText>{sizeError}</ErrorText>}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => generate(p.id)}
              title={p.desc}
              className={cn(
                "px-3 py-2 rounded-lg border text-xs font-bold transition-all active:scale-95",
                preset === p.id
                  ? "border-foreground bg-foreground text-white"
                  : "border-line bg-surface text-gray-700 hover:bg-subtle hover:text-foreground"
              )}
            >
              {p.name}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-muted">프리셋을 누르면 해당 크기로 새 배열을 만듭니다.</p>
      </div>

      <form onSubmit={submitCustom} className="flex flex-col gap-2">
        <label htmlFor="custom-values" className="text-sm text-muted">
          직접 입력 <span className="text-muted text-xs">(0~{MAX_VALUE} 정수, 쉼표·공백 구분)</span>
        </label>
        <div className="flex gap-2">
          <input
            id="custom-values"
            type="text"
            value={customText}
            onChange={(e) => {
              setCustomText(e.target.value);
              setCustomError(null);
            }}
            placeholder="예: 10, 50, 20, 80"
            aria-invalid={customError !== null}
            className={cn(
              "flex-1 min-w-0 bg-surface border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-faint focus:outline-none",
              customError ? "border-red-500" : "border-line focus:border-foreground"
            )}
          />
          <button
            type="submit"
            disabled={!customText.trim()}
            className="px-4 py-2 rounded-lg text-sm font-bold bg-foreground text-white border border-foreground hover:bg-gray-700 transition-all disabled:opacity-40"
          >
            적용
          </button>
        </div>
        {customError && <ErrorText>{customError}</ErrorText>}
      </form>
    </section>
  );
}
