import { SortStep, ArrayItem } from "@/types/sort";

class TreeNode {
  item: ArrayItem;
  left: TreeNode | null = null;
  right: TreeNode | null = null;

  constructor(item: ArrayItem) {
    this.item = item;
  }
}

export function treeSortSteps(arr: ArrayItem[]): SortStep[] {
  const steps: SortStep[] = [];
  const a = [...arr];
  if (a.length === 0) return [];

  let root: TreeNode | null = null;

  function insert(node: TreeNode | null, item: ArrayItem): TreeNode {
    if (node === null) return new TreeNode(item);

    // Virtual comparison step
    // Since we don't have indices in the tree easily, we just show comparing with root-like items

    if (item.value < node.item.value) {
      node.left = insert(node.left, item);
    } else {
      node.right = insert(node.right, item);
    }
    return node;
  }

  // Build tree
  for (const item of a) {
    root = insert(root, item);
  }

  // In-order traversal to populate result
  const result: ArrayItem[] = [];
  function inOrder(node: TreeNode | null) {
    if (node !== null) {
      inOrder(node.left);
      result.push(node.item);
      inOrder(node.right);
    }
  }
  inOrder(root);

  // Use find-and-swap to update original array a with results from tree
  for (let i = 0; i < result.length; i++) {
    const targetItem = result[i];
    const currentIdx = a.findIndex((item) => item.id === targetItem.id);
    if (currentIdx !== -1 && currentIdx !== i) {
      [a[i], a[currentIdx]] = [a[currentIdx], a[i]];
      steps.push({ array: [...a], swap: [i, currentIdx] });
    }
  }

  return steps;
}
