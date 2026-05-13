// Plain snapshot shapes mirroring the server Schema. Used by the React layer
// instead of holding live Colyseus Schema refs (those are non-cloneable and
// don't play well with Strict Mode + useState).

export type FallingPieceSnap = {
  type: number;
  rot: number;
  x: number;
  y: number;
};

export type PlayerBoardSnap = {
  sessionId: string;
  userId: number;
  nickname: string;
  connected: boolean;
  ready: boolean;
  alive: boolean;
  tokens: number;
  cells: number[];
  cur: FallingPieceSnap;
  hold: number;
  holdUsed: boolean;
  nextQueue: number[];
  level: number;
  lines: number;
  score: number;
  incomingGarbage: number;
  lastClearTs: number;
};

export type LogEntrySnap = {
  ts: number;
  kind: string;
  text: string;
  actor: string;
  target: string;
};

export type TetrisStateSnap = {
  hostSessionId: string;
  roomName: string;
  phase: "lobby" | "playing" | "roundEnd" | "gameEnd" | string;
  maxPlayers: number;
  tokensToWin: number;
  players: Record<string, PlayerBoardSnap>;
  seatOrder: string[];
  roundWinnerId: string;
  lastWinnerId: string;
  gameWinnerId: string;
  log: LogEntrySnap[];
};

export type InputAction =
  | "left"
  | "right"
  | "softDrop"
  | "hardDrop"
  | "rotateCW"
  | "rotateCCW"
  | "hold";

export type LineClearedMsg = {
  boardSid: string;
  rows: number[];
  count: number;
  attack: number;
  attackTargets: string[];
  ts: number;
};
