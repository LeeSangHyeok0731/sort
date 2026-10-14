import { describe, expect, it } from "vitest";
import { ALGORITHMS, runSort } from "@/entities/sort-algorithm";
import type { ArrayItem } from "@/shared/model";
import { Track } from "./track";

const input: ArrayItem[] = [5, 3, 8, 1, 9, 2, 7, 3].map((value, id) => ({ id, value }));

describe("Track", () => {
  it.each(ALGORITHMS.filter((a) => a.id !== "bogo").map((a) => [a.id, a] as const))(
    "%s: 끝까지 재생하면 정렬 결과와 같고, 처음으로 되감으면 입력과 같다",
    (_, algorithm) => {
      const result = runSort(algorithm, input);
      const track = new Track(input, result);

      track.seek(track.total);
      expect(track.done).toBe(true);
      expect(track.array).toEqual(result.final);

      track.seek(0);
      expect(track.array).toEqual(input);
      expect(track.stats).toEqual({ compares: 0, swaps: 0, moves: 0, reads: 0 });
    }
  );

  it("한 단계씩 앞뒤로 움직이며 통계를 증감한다", () => {
    const algorithm = ALGORITHMS.find((a) => a.id === "bubble")!;
    const track = new Track(input, runSort(algorithm, input));

    expect(track.backward()).toBe(false);
    expect(track.highlight()).toBeNull();

    track.forward();
    expect(track.cursor).toBe(1);
    expect(track.stats.compares).toBe(1);
    expect(track.highlight()).toEqual({ tone: "compare", indices: [0, 1] });

    track.forward(); // 5 > 3 이므로 교환
    expect(track.stats.swaps).toBe(1);
    expect(track.highlight()).toEqual({ tone: "change", indices: [0, 1] });
    expect(track.array.map((x) => x.value).slice(0, 2)).toEqual([3, 5]);

    track.backward();
    expect(track.stats.swaps).toBe(0);
    expect(track.array.map((x) => x.value).slice(0, 2)).toEqual([5, 3]);
  });

  it("seek는 범위를 벗어난 값을 보정한다", () => {
    const algorithm = ALGORITHMS.find((a) => a.id === "merge")!;
    const track = new Track(input, runSort(algorithm, input));
    track.seek(1e9);
    expect(track.cursor).toBe(track.total);
    track.seek(-5);
    expect(track.cursor).toBe(0);
    expect(track.forward()).toBe(true);
  });

  it("입력 배열을 변경하지 않는다", () => {
    const copy = structuredClone(input);
    const algorithm = ALGORITHMS.find((a) => a.id === "quick")!;
    new Track(input, runSort(algorithm, input)).seek(Infinity);
    expect(input).toEqual(copy);
  });
});
