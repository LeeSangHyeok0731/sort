import type { BarTone } from "@/entities/array";

/** 연산 종류별 음색 (막대 색과 같은 구분) */
const WAVE: Record<BarTone, OscillatorType> = {
  compare: "triangle",
  change: "square",
  read: "sine",
};

/** 음색마다 체감 음량이 달라 맞춰 준다 (사각파는 같은 크기에서도 훨씬 크게 들린다) */
const PEAK_GAIN: Record<BarTone, number> = {
  compare: 0.14,
  change: 0.05,
  read: 0.12,
};

/** 동시에 울릴 수 있는 음 개수. 넘으면 새 음을 건너뛴다 (고배속에서 소리가 뭉개지지 않게) */
const MAX_VOICES = 12;

type BlipOptions = {
  /** -1(왼쪽) ~ 1(오른쪽) */
  pan?: number;
  durationMs?: number;
  /** 지금부터 몇 ms 뒤에 울릴지 */
  delayMs?: number;
  /** 동시 음 개수 제한을 무시 (완료 효과처럼 미리 예약하는 음) */
  force?: boolean;
};

/** Web Audio로 짧은 음(blip)을 낸다. 브라우저 정책상 사용자 동작 안에서 unlock()을 먼저 불러야 한다. */
export class SortSynth {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private voices = 0;

  /** 오디오를 켠다. 클릭·키 입력 같은 사용자 동작 처리 중에 불러야 소리가 허용된다. */
  unlock() {
    if (typeof window === "undefined" || typeof AudioContext === "undefined") return;
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.7;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  get ready() {
    return this.ctx?.state === "running";
  }

  blip(frequency: number, tone: BarTone, { pan = 0, durationMs = 70, delayMs = 0, force = false }: BlipOptions = {}) {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master || ctx.state !== "running") return;
    if (!force && this.voices >= MAX_VOICES) return;

    const start = ctx.currentTime + delayMs / 1000;
    const end = start + durationMs / 1000;

    const osc = ctx.createOscillator();
    osc.type = WAVE[tone];
    osc.frequency.value = frequency;

    // 딸깍거리지 않도록 짧게 커졌다가 빠르게 줄어드는 음량 곡선
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(PEAK_GAIN[tone], start + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    osc.connect(gain);
    let output: AudioNode = gain;
    if (pan !== 0 && typeof ctx.createStereoPanner === "function") {
      const panner = ctx.createStereoPanner();
      panner.pan.value = pan;
      gain.connect(panner);
      output = panner;
    }
    output.connect(master);

    this.voices++;
    osc.onended = () => {
      this.voices--;
      osc.disconnect();
      output.disconnect();
    };
    osc.start(start);
    osc.stop(end + 0.02);
  }

  close() {
    void this.ctx?.close();
    this.ctx = null;
    this.master = null;
    this.voices = 0;
  }
}
