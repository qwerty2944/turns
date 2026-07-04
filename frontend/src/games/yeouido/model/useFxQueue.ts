"use client";

import { useCallback, useRef, useState } from "react";
import {
  deriveVisual,
  type FxBatch,
  type FxEvent,
  type Loc,
  type Snap,
  type VisualState,
  type VisualUnit,
} from "./types";

export type YdAnnouncement =
  | { kind: "turn"; sid: string }
  | { kind: "play"; sid: string; cardId: string }
  | { kind: "rattle"; cardId: string }
  | { kind: "burn"; sid: string; cardId: string }
  | { kind: "discard"; sid: string; cardId: string }
  | { kind: "fatigue"; sid: string; n: number }
  | { kind: "heroPower"; sid: string };

export type FxHandlers = {
  /** FLIP lunge; resolves at the moment of impact (return anim continues). */
  playAttack: (from: Loc, to: Loc) => Promise<void>;
  /** Impact burst + camera/DOM shake at a location. */
  impact: (at: Loc, power: number) => void;
  pop: (at: Loc, n: number, kind: "dmg" | "heal") => void;
  shatter: (at: Loc) => void;
  summonDust: (at: Loc) => void;
  spellFx: (e: Extract<FxEvent, { t: "spell" }>) => void;
  announce: (a: YdAnnouncement, ms: number) => void;
  onGameEnd: (winnerSid: string) => void;
};

const sleep = (ms: number) =>
  ms <= 0 ? Promise.resolve() : new Promise<void>((r) => setTimeout(r, ms));

/**
 * FX-driven visual state. Boards and hero HP render exclusively from
 * `visual` — never from the Colyseus snap — so the state patch racing
 * ahead of the animation can't spoil it.
 *
 * Reconcile rules:
 * - While the pump is idle, EVERY snap change re-derives the visual
 *   wholesale (this covers seeding, reconnect, and drift repair).
 * - On queue drain we only reconcile immediately if a snap arrived after
 *   the last fx batch was received (the patch always trails its fx);
 *   otherwise we leave the fx-final visual (identical to the incoming
 *   patch) and let the next onSnap re-derive.
 */
export const useFxQueue = (opts: {
  snapRef: React.RefObject<Snap | null>;
  handlersRef: React.RefObject<FxHandlers | null>;
}) => {
  const { snapRef, handlersRef } = opts;
  const [visual, setVisual] = useState<VisualState | null>(null);
  const vsRef = useRef<VisualState | null>(null);
  const batchesRef = useRef<FxBatch[]>([]);
  const runningRef = useRef(false);
  const snapVersionRef = useRef(0);
  const versionAtLastBatchRef = useRef(-1);
  const [animating, setAnimating] = useState(false);

  const commit = useCallback(() => {
    const v = vsRef.current;
    setVisual(
      v
        ? {
            boards: Object.fromEntries(
              Object.entries(v.boards).map(([k, arr]) => [k, [...arr]]),
            ),
            heroes: { ...v.heroes },
          }
        : null,
    );
  }, []);

  const findUnit = (uid: string): { unit: VisualUnit; sid: string } | null => {
    const v = vsRef.current;
    if (!v) return null;
    for (const [sid, board] of Object.entries(v.boards)) {
      const unit = board.find((u) => u.uid === uid);
      if (unit) return { unit, sid };
    }
    return null;
  };

  const applyHpChange = (at: Loc, hp: number) => {
    const v = vsRef.current;
    if (!v) return;
    if (at.hero) {
      const hero = v.heroes[at.sid];
      if (hero) {
        v.heroes[at.sid] = { hp, hitKey: hero.hitKey + 1 };
      }
      return;
    }
    if (!at.uid) return;
    const found = findUnit(at.uid);
    if (found) {
      found.unit.hp = hp;
      found.unit.hitKey = (found.unit.hitKey ?? 0) + 1;
    }
  };

  const runBatch = async (events: FxEvent[], instant: boolean) => {
    const D = (ms: number) => (instant ? 0 : ms);
    const h = () => handlersRef.current;
    let i = 0;
    while (i < events.length) {
      const e = events[i];
      switch (e.t) {
        case "turnStart":
          if (!instant) h()?.announce({ kind: "turn", sid: e.sid }, 900);
          await sleep(D(650));
          i++;
          break;
        case "draw":
          await sleep(D(160));
          i++;
          break;
        case "fatigue":
          if (!instant) h()?.announce({ kind: "fatigue", sid: e.sid, n: e.n }, 900);
          await sleep(D(550));
          i++;
          break;
        case "burn":
          if (!instant) h()?.announce({ kind: "burn", sid: e.sid, cardId: e.cardId }, 900);
          await sleep(D(650));
          i++;
          break;
        case "discard":
          if (!instant) h()?.announce({ kind: "discard", sid: e.sid, cardId: e.cardId }, 1000);
          await sleep(D(750));
          i++;
          break;
        case "playCard":
          if (!instant) h()?.announce({ kind: "play", sid: e.sid, cardId: e.cardId }, 950);
          await sleep(D(700));
          i++;
          break;
        case "heroPower":
          if (!instant) h()?.announce({ kind: "heroPower", sid: e.sid }, 800);
          await sleep(D(450));
          i++;
          break;
        case "spell":
          if (!instant) h()?.spellFx(e);
          await sleep(D(420));
          i++;
          break;
        case "rattle":
          if (!instant) h()?.announce({ kind: "rattle", cardId: e.cardId }, 800);
          await sleep(D(500));
          i++;
          break;
        case "summon": {
          const v = vsRef.current;
          if (v) {
            const board = v.boards[e.sid] ?? (v.boards[e.sid] = []);
            const unit: VisualUnit = {
              uid: e.uid,
              cardId: e.cardId,
              atk: e.atk,
              hp: e.hp,
              maxHp: e.maxHp,
              taunt: e.taunt,
              rush: e.rush,
              silenced: false,
              justPlayed: true,
              canAttack: e.rush && e.atk > 0,
              entering: !instant,
              hitKey: 0,
            };
            board.splice(Math.min(e.slot, board.length), 0, unit);
            commit();
            if (!instant) h()?.summonDust({ sid: e.sid, uid: e.uid });
            await sleep(D(380));
            unit.entering = false;
            commit();
          }
          i++;
          break;
        }
        case "attack": {
          const dmgs: Extract<FxEvent, { t: "dmg" }>[] = [];
          let j = i + 1;
          while (j < events.length && events[j].t === "dmg") {
            dmgs.push(events[j] as Extract<FxEvent, { t: "dmg" }>);
            j++;
          }
          const attacker = findUnit(e.from.uid);
          if (attacker) attacker.unit.canAttack = false;
          if (!instant) {
            await h()?.playAttack({ sid: e.from.sid, uid: e.from.uid }, e.to);
          }
          for (const d of dmgs) {
            applyHpChange(d.at, d.hp);
            if (!instant) h()?.pop(d.at, d.n, "dmg");
          }
          if (!instant) h()?.impact(e.to, dmgs[0]?.n ?? 1);
          commit();
          await sleep(D(340));
          i = j;
          break;
        }
        case "dmg":
          applyHpChange(e.at, e.hp);
          if (!instant) {
            h()?.pop(e.at, e.n, "dmg");
            h()?.impact(e.at, e.n);
          }
          commit();
          await sleep(D(380));
          i++;
          break;
        case "heal":
          applyHpChange(e.at, e.hp);
          if (!instant) h()?.pop(e.at, e.n, "heal");
          commit();
          await sleep(D(320));
          i++;
          break;
        case "buff": {
          if (e.at.uid) {
            const found = findUnit(e.at.uid);
            if (found) {
              found.unit.atk = e.atk;
              found.unit.hp = e.hp;
              found.unit.maxHp = e.maxHp;
              found.unit.hitKey = (found.unit.hitKey ?? 0) + 1;
            }
          }
          commit();
          await sleep(D(280));
          i++;
          break;
        }
        case "silence": {
          if (e.at.uid) {
            const found = findUnit(e.at.uid);
            if (found) {
              found.unit.silenced = true;
              found.unit.taunt = false;
              found.unit.rush = false;
            }
          }
          commit();
          await sleep(D(280));
          i++;
          break;
        }
        case "grantTaunt": {
          if (e.at.uid) {
            const found = findUnit(e.at.uid);
            if (found) found.unit.taunt = true;
          }
          commit();
          await sleep(D(220));
          i++;
          break;
        }
        case "transform": {
          if (e.at.uid) {
            const found = findUnit(e.at.uid);
            if (found) {
              found.unit.cardId = e.toCardId;
              found.unit.atk = e.atk;
              found.unit.hp = e.hp;
              found.unit.maxHp = e.hp;
              found.unit.taunt = false;
              found.unit.rush = false;
              found.unit.silenced = false;
              found.unit.hitKey = (found.unit.hitKey ?? 0) + 1;
            }
          }
          commit();
          await sleep(D(380));
          i++;
          break;
        }
        case "death": {
          const deaths: Extract<FxEvent, { t: "death" }>[] = [];
          let j = i;
          while (j < events.length && events[j].t === "death") {
            deaths.push(events[j] as Extract<FxEvent, { t: "death" }>);
            j++;
          }
          for (const d of deaths) {
            const found = findUnit(d.at.uid);
            if (found) {
              found.unit.dying = !instant;
              if (!instant) h()?.shatter(d.at);
            }
          }
          commit();
          await sleep(D(430));
          const v = vsRef.current;
          if (v) {
            for (const d of deaths) {
              const board = v.boards[d.at.sid];
              if (board) {
                const idx = board.findIndex((u) => u.uid === d.at.uid);
                if (idx >= 0) board.splice(idx, 1);
              }
            }
          }
          commit();
          i = j;
          break;
        }
        case "gameEnd":
          await sleep(D(600));
          h()?.onGameEnd(e.winnerSid);
          i++;
          break;
        default:
          i++;
      }
    }
  };

  const pump = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    setAnimating(true);
    try {
      while (batchesRef.current.length > 0) {
        const instant = batchesRef.current.length > 2;
        const batch = batchesRef.current.shift()!;
        await runBatch(batch.events, instant);
      }
      // Only reconcile if the authoritative patch has already landed —
      // otherwise the fx-final visual IS the correct state and the next
      // onSnap will re-derive.
      if (snapVersionRef.current > versionAtLastBatchRef.current) {
        vsRef.current = deriveVisual(snapRef.current);
        commit();
      }
    } finally {
      runningRef.current = false;
      setAnimating(false);
      if (batchesRef.current.length > 0) void pump();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Register on room.onMessage("fx"). Stable. */
  const onFxBatch = useCallback(
    (batch: FxBatch) => {
      versionAtLastBatchRef.current = snapVersionRef.current;
      batchesRef.current.push(batch);
      void pump();
    },
    [pump],
  );

  /** Call on every Colyseus state change (after snapRef is updated). Stable. */
  const onSnap = useCallback(() => {
    snapVersionRef.current += 1;
    if (!runningRef.current) {
      vsRef.current = deriveVisual(snapRef.current);
      commit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { visual, animating, onFxBatch, onSnap };
};
