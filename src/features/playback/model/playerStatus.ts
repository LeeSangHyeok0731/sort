export type PlayerStatus = "idle" | "computing" | "error" | "playing" | "paused" | "done";

type StatusInput = {
  /** 현재 입력·구성의 트랙이 준비됐다 */
  ready: boolean;
  /** 현재 입력·구성으로 백그라운드 계산 중이다 */
  computing: boolean;
  /** 현재 입력·구성의 계산이 실패했다 */
  failed: boolean;
  /** 프레임 루프가 돌고 있다 */
  active: boolean;
  /** 모든 트랙이 끝까지 재생됐다 */
  allDone: boolean;
};

/** 재생기 상태를 정한다. 준비 전에는 계산 중 > 실패 > 준비됨 순으로 본다 */
export function resolvePlayerStatus({ ready, computing, failed, active, allDone }: StatusInput): PlayerStatus {
  if (!ready) {
    if (computing) return "computing";
    return failed ? "error" : "idle";
  }
  if (active) return "playing";
  return allDone ? "done" : "paused";
}

const FALLBACK_DETAIL = "알 수 없는 오류";
/** 재생바 한 줄에 들어가도록 자세한 내용은 이 길이에서 자른다 */
const MAX_DETAIL_LENGTH = 120;

/** 백그라운드 계산 오류를 사용자에게 보여 줄 한국어 메시지로 바꾼다 */
export function describeSortError(error: unknown): string {
  let detail = "";
  if (error instanceof Error) detail = error.message;
  else if (typeof error === "string") detail = error;
  // 워커가 String(error)로 보낸 "Error: ..." 접두어는 사용자에게 의미가 없다
  detail = detail.replace(/^\s*(?:\w*Error:\s*)+/, "").trim();
  if (!detail) detail = FALLBACK_DETAIL;
  if (detail.length > MAX_DETAIL_LENGTH) detail = `${detail.slice(0, MAX_DETAIL_LENGTH - 1)}…`;
  return `정렬 계산에 실패했습니다: ${detail}`;
}
