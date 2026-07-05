/**
 * Shared shapes for 여의도 대전 — FxEvent mirrors
 * backend/src/games/yeouido/fx.ts exactly.
 */

export type Loc = { sid: string; uid?: string; hero?: boolean };

export type FxEvent =
  | { t: "turnStart"; sid: string; turn: number }
  | { t: "draw"; sid: string }
  | { t: "fatigue"; sid: string; n: number }
  | { t: "burn"; sid: string; cardId: string }
  | { t: "playCard"; sid: string; cardId: string; kind: "unit" | "spell" }
  | {
      t: "summon";
      sid: string;
      uid: string;
      cardId: string;
      slot: number;
      atk: number;
      hp: number;
      maxHp: number;
      taunt: boolean;
      rush: boolean;
    }
  | { t: "attack"; from: { sid: string; uid: string }; to: Loc }
  | { t: "dmg"; at: Loc; n: number; hp: number }
  | { t: "heal"; at: Loc; n: number; hp: number }
  | { t: "buff"; at: Loc; atk: number; hp: number; maxHp: number }
  | { t: "silence"; at: Loc }
  | { t: "grantTaunt"; at: Loc }
  | { t: "transform"; at: Loc; toCardId: string; atk: number; hp: number }
  | { t: "death"; at: { sid: string; uid: string }; cardId: string }
  | { t: "rattle"; sid: string; uid: string; cardId: string }
  | { t: "spell"; sid: string; cardId: string; at?: Loc; aoe?: "enemy" | "all" | "friendly" }
  | { t: "heroPower"; sid: string }
  | { t: "discard"; sid: string; cardId: string }
  | { t: "gameEnd"; winnerSid: string };

export type FxBatch = { seq: number; events: FxEvent[] };

// ─── Authoritative snapshot (from Colyseus state) ───

export type UnitSnap = {
  uid: string;
  cardId: string;
  atk: number;
  hp: number;
  maxHp: number;
  canAttack: boolean;
  taunt: boolean;
  rush: boolean;
  silenced: boolean;
  justPlayed: boolean;
};

export type PlayerSnap = {
  sessionId: string;
  userId: number;
  nickname: string;
  connected: boolean;
  ready: boolean;
  faction: string;
  hp: number;
  maxHp: number;
  mana: number;
  manaMax: number;
  deckCount: number;
  handCount: number;
  fatigue: number;
  heroPowerUsed: boolean;
  board: UnitSnap[];
};

export type LogEntrySnap = {
  ts: number;
  kind: string;
  text: string;
  actor: string;
  target: string;
  card: string;
};

export type Snap = {
  hostSessionId: string;
  roomName: string;
  phase: string;
  turnSid: string;
  turnEndsAt: number;
  turnNumber: number;
  winnerSid: string;
  players: Record<string, PlayerSnap>;
  log: LogEntrySnap[];
};

export const toSnap = (state: any): Snap | null => {
  if (!state) return null;
  const players: Record<string, PlayerSnap> = {};
  state.players?.forEach?.((p: any, key: string) => {
    const board: UnitSnap[] = [];
    p.board?.forEach?.((u: any) => {
      board.push({
        uid: u.uid,
        cardId: u.cardId,
        atk: u.atk,
        hp: u.hp,
        maxHp: u.maxHp,
        canAttack: u.canAttack,
        taunt: u.taunt,
        rush: u.rush,
        silenced: u.silenced,
        justPlayed: u.justPlayed,
      });
    });
    players[key] = {
      sessionId: p.sessionId,
      userId: p.userId,
      nickname: p.nickname,
      connected: p.connected,
      ready: p.ready,
      faction: p.faction,
      hp: p.hp,
      maxHp: p.maxHp,
      mana: p.mana,
      manaMax: p.manaMax,
      deckCount: p.deckCount,
      handCount: p.handCount,
      fatigue: p.fatigue,
      heroPowerUsed: p.heroPowerUsed,
      board,
    };
  });
  return {
    hostSessionId: state.hostSessionId,
    roomName: state.roomName,
    phase: state.phase,
    turnSid: state.turnSid,
    turnEndsAt: state.turnEndsAt,
    turnNumber: state.turnNumber,
    winnerSid: state.winnerSid,
    players,
    log: state.log
      ? Array.from(state.log).map((e: any) => ({
          ts: e.ts,
          kind: e.kind,
          text: e.text,
          actor: e.actor,
          target: e.target,
          card: e.card,
        }))
      : [],
  };
};

// ─── Visual state (fx-driven render source for boards + hero HP) ───

export type VisualUnit = {
  uid: string;
  cardId: string;
  atk: number;
  hp: number;
  maxHp: number;
  taunt: boolean;
  rush: boolean;
  silenced: boolean;
  justPlayed: boolean;
  canAttack: boolean;
  // transient animation flags
  entering?: boolean;
  dying?: boolean;
  hitKey?: number; // bump to retrigger .yd-hit
};

export type VisualState = {
  boards: Record<string, VisualUnit[]>;
  heroes: Record<string, { hp: number; hitKey: number }>;
};

export const deriveVisual = (snap: Snap | null): VisualState | null => {
  if (!snap) return null;
  const vs: VisualState = { boards: {}, heroes: {} };
  for (const [sid, p] of Object.entries(snap.players)) {
    vs.boards[sid] = p.board.map((u) => ({ ...u, hitKey: 0 }));
    vs.heroes[sid] = { hp: p.hp, hitKey: 0 };
  }
  return vs;
};
