export type ArrayItem = {
  id: number;
  value: number;
};

export type SortStep = {
  array: ArrayItem[];
  compare?: [number, number];
  swap?: [number, number];
};
