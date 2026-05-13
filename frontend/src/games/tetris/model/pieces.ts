// Mirror of backend rules.ts — shapes for rendering the falling piece +
// ghost + Next/Hold previews. Kept identical to server so client display
// matches server-authoritative state.

export const BOARD_W = 10;
export const BOARD_H = 20;

export const PIECE = {
  I: 1,
  O: 2,
  T: 3,
  S: 4,
  Z: 5,
  J: 6,
  L: 7,
} as const;

export const GARBAGE_CELL = 8;

// Pixel-art palette tuned to globals.css color tokens. Garbage = neutral gray.
export const PIECE_COLOR: Record<number, string> = {
  1: "#22d3ee", // I — cyan
  2: "#facc15", // O — gold
  3: "#a855f7", // T — purple
  4: "#22c55e", // S — green
  5: "#ef4444", // Z — red
  6: "#3b82f6", // J — blue
  7: "#f97316", // L — orange
  8: "#6b7280", // garbage
};

export const PIECE_NAMES: Record<number, string> = {
  1: "I", 2: "O", 3: "T", 4: "S", 5: "Z", 6: "J", 7: "L",
};

export const PIECE_SHAPES: Record<number, Array<Array<[number, number]>>> = {
  1: [
    [[0,1],[1,1],[2,1],[3,1]],
    [[2,0],[2,1],[2,2],[2,3]],
    [[0,2],[1,2],[2,2],[3,2]],
    [[1,0],[1,1],[1,2],[1,3]],
  ],
  2: [
    [[1,0],[2,0],[1,1],[2,1]],
    [[1,0],[2,0],[1,1],[2,1]],
    [[1,0],[2,0],[1,1],[2,1]],
    [[1,0],[2,0],[1,1],[2,1]],
  ],
  3: [
    [[1,0],[0,1],[1,1],[2,1]],
    [[1,0],[1,1],[2,1],[1,2]],
    [[0,1],[1,1],[2,1],[1,2]],
    [[1,0],[0,1],[1,1],[1,2]],
  ],
  4: [
    [[1,0],[2,0],[0,1],[1,1]],
    [[1,0],[1,1],[2,1],[2,2]],
    [[1,1],[2,1],[0,2],[1,2]],
    [[0,0],[0,1],[1,1],[1,2]],
  ],
  5: [
    [[0,0],[1,0],[1,1],[2,1]],
    [[2,0],[1,1],[2,1],[1,2]],
    [[0,1],[1,1],[1,2],[2,2]],
    [[1,0],[0,1],[1,1],[0,2]],
  ],
  6: [
    [[0,0],[0,1],[1,1],[2,1]],
    [[1,0],[2,0],[1,1],[1,2]],
    [[0,1],[1,1],[2,1],[2,2]],
    [[1,0],[1,1],[0,2],[1,2]],
  ],
  7: [
    [[2,0],[0,1],[1,1],[2,1]],
    [[1,0],[1,1],[1,2],[2,2]],
    [[0,1],[1,1],[2,1],[0,2]],
    [[0,0],[1,0],[1,1],[1,2]],
  ],
};

export const occupiedCells = (
  type: number,
  rot: number,
  x: number,
  y: number,
): Array<[number, number]> => {
  const shape = PIECE_SHAPES[type]?.[rot & 3] ?? [];
  return shape.map(([dx, dy]) => [x + dx, y + dy]);
};

export const inPlayBounds = (x: number, y: number) =>
  x >= 0 && x < BOARD_W && y >= 0 && y < BOARD_H;

export const KEY_BINDINGS: Record<string, string> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowDown: "softDrop",
  ArrowUp: "rotateCW",
  " ": "hardDrop",
  Space: "hardDrop",
  z: "rotateCCW",
  Z: "rotateCCW",
  x: "rotateCW",
  X: "rotateCW",
  c: "hold",
  C: "hold",
  Shift: "hold",
};
