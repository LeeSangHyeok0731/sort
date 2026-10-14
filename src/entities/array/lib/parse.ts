import { MAX_ARRAY_SIZE, MAX_VALUE, MIN_ARRAY_SIZE, MIN_VALUE } from "../model/constants";

export type ParseResult =
  | { ok: true; values: number[] }
  | { ok: false; error: string };

/** "10, 50 20" 처럼 쉼표/공백으로 구분된 정수 목록을 검증하며 파싱한다. */
export function parseCustomValues(text: string): ParseResult {
  const tokens = text.split(/[\s,]+/).filter(Boolean);

  if (tokens.length < MIN_ARRAY_SIZE) {
    return { ok: false, error: `숫자를 ${MIN_ARRAY_SIZE}개 이상 입력해 주세요.` };
  }
  if (tokens.length > MAX_ARRAY_SIZE) {
    return { ok: false, error: `최대 ${MAX_ARRAY_SIZE}개까지 입력할 수 있어요. (현재 ${tokens.length}개)` };
  }

  const values: number[] = [];
  for (const token of tokens) {
    if (!/^\d+$/.test(token)) {
      return { ok: false, error: `"${token}"은(는) ${MIN_VALUE} 이상의 정수가 아니에요.` };
    }
    const value = Number(token);
    if (value > MAX_VALUE) {
      return { ok: false, error: `값은 ${MAX_VALUE} 이하만 가능해요. ("${token}")` };
    }
    values.push(value);
  }
  return { ok: true, values };
}

/** 크기 입력값을 검증한다. 숫자가 아니면 null. */
export function parseSize(text: string): number | null {
  if (!/^\d+$/.test(text.trim())) return null;
  return Number(text.trim());
}
