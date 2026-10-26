// 브라우저 측정 코드. 측정할 페이지의 개발자 도구 콘솔에 붙여 넣고 아래 사용법대로 호출한다.
// 두 버전 모두 프로덕션 빌드(next build + next start)로 띄우고, 탭을 앞에 둔 채로 잰다
// (뒤에 있는 탭은 requestAnimationFrame이 느려진다).
//
// 지금 버전:  location.href = __newUrl('bubble', 1000, 16)   // 페이지가 다시 열리면 이 파일을 다시 붙여 넣고
//            await __runNew(5000)
// 예전 버전:  ?algo=bubble&speed=16&size=1000 으로 연 뒤
//            await __oldSetup(1000, 1); await __runOld(5000)
//
// 결과: syncMs(클릭 처리) · firstFrameMs(클릭 후 멈춤) · startDelayMs(재생 시작까지) ·
//       stepsPerSec(초당 단계) · frameAvg/P95/Max(프레임 간격) · longTaskMax/Total(50ms 넘는 작업)

/** Node 측정(case.ts)과 같은 seed 생성기(mulberry32)로 1..n 순열을 만든다 */
window.__perm = (n, seed) => {
  let s = seed >>> 0;
  const r = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const v = Array.from({ length: n }, (_, i) => i + 1);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [v[i], v[j]] = [v[j], v[i]];
  }
  return v;
};

/** startEl을 클릭하고, 화면의 "현재 / 전체" 진행 표시를 매 프레임 읽어 재생 성능을 잰다 */
window.__measure = ({ startEl, pattern, maxMs = 6000 }) =>
  new Promise((resolve) => {
    const re = new RegExp(pattern);
    let el = null;
    const find = () => {
      let best = null;
      for (const e of document.querySelectorAll("div,span,p")) {
        if (re.test(e.textContent) && (!best || e.textContent.length < best.textContent.length)) best = e;
      }
      return best;
    };
    const progress = () => {
      if (!el || !el.isConnected) el = find();
      const m = el && el.textContent.match(re);
      return m ? [Number(m[1].replace(/,/g, "")), Number(m[2].replace(/,/g, ""))] : [0, 0];
    };
    const longTasks = [];
    const po = new PerformanceObserver((l) => l.getEntries().forEach((e) => longTasks.push(e.duration)));
    po.observe({ type: "longtask" });
    const t0 = performance.now();
    startEl.click();
    const syncMs = performance.now() - t0;
    let firstFrame = null;
    let startAt = null;
    let startP = 0;
    let last = null;
    const frames = [];
    const tick = (now) => {
      if (firstFrame === null) firstFrame = performance.now() - t0;
      const [p, tot] = progress();
      if (startAt === null && p > 0) {
        startAt = now;
        startP = p;
      }
      if (startAt !== null) {
        if (last !== null) frames.push(now - last.t);
        last = { t: now, p };
      }
      const done = tot > 0 && p >= tot;
      if (startAt !== null && (now - startAt >= maxMs || done)) {
        po.disconnect();
        const sorted = [...frames].sort((a, b) => a - b);
        const span = (last.t - startAt) / 1000;
        resolve({
          syncMs: +syncMs.toFixed(1),
          firstFrameMs: +firstFrame.toFixed(1),
          startDelayMs: +(startAt - t0).toFixed(1),
          totalSteps: tot,
          stepsPerSec: span > 0 ? Math.round((last.p - startP) / span) : null,
          frameAvg: +(frames.reduce((a, b) => a + b, 0) / Math.max(1, frames.length)).toFixed(1),
          frameP95: +(sorted[Math.floor(sorted.length * 0.95)] ?? 0).toFixed(1),
          frameMax: +(sorted[sorted.length - 1] ?? 0).toFixed(1),
          longTaskMax: Math.round(Math.max(0, ...longTasks)),
          longTaskTotal: Math.round(longTasks.reduce((a, b) => a + b, 0)),
          done,
        });
        return;
      }
      if (now - t0 > 180000) {
        po.disconnect();
        resolve({ timeout: true, firstFrame });
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

window.__btn = (pred) => [...document.querySelectorAll("button")].find(pred);

/** 예전 버전: 커스텀 배열 입력창에 같은 순열을 넣고 적용한다 */
window.__oldSetup = async (n, seed) => {
  const input = document.querySelector('input[placeholder^="예: 10"]');
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, __perm(n, seed).join(","));
  input.dispatchEvent(new Event("input", { bubbles: true }));
  await new Promise((r) => setTimeout(r, 100));
  __btn((b) => b.textContent.trim() === "적용").click();
  await new Promise((r) => setTimeout(r, 800));
};
window.__runOld = (maxMs) =>
  __measure({
    startEl: __btn((b) => b.textContent.trim() === "정렬 시작"),
    pattern: "([\\d,]+)\\s*/\\s*([\\d,]+)\\s*steps",
    maxMs,
  });

/** 지금 버전: 같은 순열을 data 파라미터로 넣은 주소 */
window.__newUrl = (algo, n, speed, algo2) =>
  `${location.origin}/?algo=${algo}${algo2 ? `&compare=true&algo2=${algo2}` : ""}&speed=${speed}&size=${n}&data=${__perm(n, 1).join(",")}`;
window.__runNew = (maxMs) =>
  __measure({
    startEl: __btn((b) => b.getAttribute("aria-label") === "재생"),
    pattern: "([\\d,]+)\\s*/\\s*([\\d,]+)\\s*연산",
    maxMs,
  });
