/** 단축키로 실행하는 동작 */
export type ShortcutAction =
  | "toggle"
  | "stepForward"
  | "stepBackward"
  | "shuffle"
  | "toggleSound";

/** 키 이벤트에서 판단에 필요한 값만 뽑은 것 (DOM 없이 테스트할 수 있게) */
export type ShortcutKeyInput = {
  key: string;
  /** 이벤트 대상의 태그 이름. 대상이 요소가 아니면(window·document) null */
  tagName?: string | null;
  /** 대상이 INPUT일 때 그 type 속성 */
  inputType?: string | null;
  isContentEditable?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
};

export type ShortcutDecision = {
  action: ShortcutAction;
  /** 브라우저 기본 동작(스크롤, 버튼 클릭, 체크 토글)을 막을지 */
  preventDefault: boolean;
} | null;

/** 포커스된 요소가 키를 어디까지 쓰는지 */
type TargetKind =
  /** 글자를 입력하는 요소: 단축키를 모두 건너뛴다 */
  | "typing"
  /** 화살표로 값을 바꾸는 요소(range, radio): 화살표만 요소에 맡긴다 */
  | "arrows"
  /** 그 밖의 요소(버튼, 체크박스, 일반 요소, 대상 없음): 단축키를 모두 처리한다 */
  | "none";

/** 화살표를 기본 동작에 맡기는 input type. range는 값 이동, radio는 그룹 안 선택 이동 */
const ARROW_INPUT_TYPES = new Set(["range", "radio"]);

/** 누르기만 하는 input type. 버튼처럼 다룬다 */
const BUTTON_LIKE_INPUT_TYPES = new Set([
  "button",
  "submit",
  "reset",
  "image",
  "checkbox",
  "color",
  "file",
]);

function targetKind(input: ShortcutKeyInput): TargetKind {
  if (input.isContentEditable) return "typing";
  const tag = input.tagName?.toUpperCase();
  if (tag === "TEXTAREA" || tag === "SELECT") return "typing";
  if (tag === "INPUT") {
    // type이 없거나 모르는 값이면 text로 취급한다 (브라우저도 text로 다룬다)
    const type = (input.inputType ?? "text").toLowerCase();
    if (ARROW_INPUT_TYPES.has(type)) return "arrows";
    if (BUTTON_LIKE_INPUT_TYPES.has(type)) return "none";
    // text, number, search, email, url, password, tel, date·time 계열 등
    return "typing";
  }
  return "none";
}

/**
 * 키 이벤트를 단축키로 처리할지 판단한다. 처리하지 않으면 null.
 *
 * - Space: 재생/일시정지, ←/→: 한 단계, R: 새 배열, M: 소리 켜기/끄기
 * - 글자 입력 요소에서는 모두 건너뛴다.
 * - range·radio에서는 화살표를 요소의 기본 동작(값·선택 이동)에 맡긴다.
 *   진행 슬라이더의 화살표는 값이 1씩 움직여 한 단계 이동과 같고, 속도 슬라이더는 속도가 바뀐다.
 * - 버튼·체크박스에 포커스가 있을 때 Space는 클릭·토글과 겹치므로 기본 동작을 막고 재생/일시정지만 한다.
 *   재생 버튼을 누른 뒤 포커스가 남아 있어도 Space가 같은 뜻으로 동작하게 하려는 것이다.
 */
export function resolveShortcut(input: ShortcutKeyInput): ShortcutDecision {
  if (input.ctrlKey || input.metaKey || input.altKey) return null;
  const kind = targetKind(input);
  if (kind === "typing") return null;

  switch (input.key) {
    case " ":
      return { action: "toggle", preventDefault: true };
    case "ArrowRight":
      return kind === "arrows" ? null : { action: "stepForward", preventDefault: true };
    case "ArrowLeft":
      return kind === "arrows" ? null : { action: "stepBackward", preventDefault: true };
    case "r":
    case "R":
      return { action: "shuffle", preventDefault: false };
    case "m":
    case "M":
      return { action: "toggleSound", preventDefault: false };
    default:
      return null;
  }
}
