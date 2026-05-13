export type MafiaPlayerView = {
  sessionId: string;
  userId: number;
  nickname: string;
  connected: boolean;
  ready: boolean;
  alive: boolean;
  revealedRole: string;
  voteTarget: string;
};

export type LogEntryView = {
  ts: number;
  kind: string;
  text: string;
  actor: string;
  target: string;
  card: number;
  guess: number;
};

export type MafiaPhase =
  | "lobby"
  | "roleReveal"
  | "night"
  | "nightReveal"
  | "day"
  | "vote"
  | "voteReveal"
  | "gameEnd";

export type MafiaStateView = {
  hostSessionId: string;
  roomName: string;
  phase: MafiaPhase;
  maxPlayers: number;
  dayCount: number;
  phaseEndsAt: number;
  players: Record<string, MafiaPlayerView>;
  lastKilledId: string;
  lastNightSaved: boolean;
  lastLynchedId: string;
  winners: string;
  log: LogEntryView[];
};

export type SeerResult = {
  targetId: string;
  nickname: string;
  isWolf: boolean;
  dayCount: number;
};

export type WolfChatMessage = {
  fromNickname: string;
  text: string;
  ts: number;
};
