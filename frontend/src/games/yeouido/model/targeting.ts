import { cardView, type Target } from "./cards";
import type { VisualState, VisualUnit } from "./types";

/**
 * Click-based targeting state machine (no drag).
 *
 * idle       — nothing selected
 * handPick   — hand card raised: unit → slot gaps highlight;
 *              targeted spell → valid targets pulse;
 *              no-target spell → confirm (second tap plays)
 * placing    — unit slot chosen, battlecry target pending
 * attacking  — my ready unit selected; legal enemy targets pulse
 */
export type TargetingState =
  | { mode: "idle" }
  | { mode: "handPick"; handIdx: number; cardId: string; confirm: boolean }
  | { mode: "placing"; handIdx: number; cardId: string; slot: number }
  | { mode: "attacking"; attackerUid: string };

export type TargetingAction =
  | { type: "pickHand"; handIdx: number; cardId: string; confirm: boolean }
  | { type: "pickSlot"; slot: number }
  | { type: "pickAttacker"; attackerUid: string }
  | { type: "cancel" };

export const IDLE: TargetingState = { mode: "idle" };

export const targetingReducer = (
  state: TargetingState,
  action: TargetingAction,
): TargetingState => {
  switch (action.type) {
    case "pickHand":
      return {
        mode: "handPick",
        handIdx: action.handIdx,
        cardId: action.cardId,
        confirm: action.confirm,
      };
    case "pickSlot":
      if (state.mode !== "handPick") return state;
      return {
        mode: "placing",
        handIdx: state.handIdx,
        cardId: state.cardId,
        slot: action.slot,
      };
    case "pickAttacker":
      return { mode: "attacking", attackerUid: action.attackerUid };
    case "cancel":
      return IDLE;
  }
};

/** Uids/heroes a selector may target right now (from the VISUAL board —
 *  display only; the server re-validates). */
export const selectorTargets = (
  selector: Target,
  meSid: string,
  enemySid: string,
  visual: VisualState | null,
): { unitUids: Set<string>; heroSids: Set<string> } => {
  const unitUids = new Set<string>();
  const heroSids = new Set<string>();
  if (!visual) return { unitUids, heroSids };
  const mine = (visual.boards[meSid] ?? []).filter((u) => !u.dying);
  const theirs = (visual.boards[enemySid] ?? []).filter((u) => !u.dying);
  const add = (units: VisualUnit[]) => units.forEach((u) => unitUids.add(u.uid));

  switch (selector) {
    case "enemyUnit":
      add(theirs);
      break;
    case "friendlyUnit":
      add(mine);
      break;
    case "anyUnit":
      add(mine);
      add(theirs);
      break;
    case "any":
      add(mine);
      add(theirs);
      heroSids.add(meSid);
      heroSids.add(enemySid);
      break;
    case "enemyAny":
      add(theirs);
      heroSids.add(enemySid);
      break;
    case "none":
      break;
  }
  return { unitUids, heroSids };
};

/** Legal attack targets for a selected attacker (taunt rule). */
export const attackTargets = (
  attackerUid: string,
  meSid: string,
  enemySid: string,
  visual: VisualState | null,
): { unitUids: Set<string>; heroSids: Set<string> } => {
  const unitUids = new Set<string>();
  const heroSids = new Set<string>();
  if (!visual) return { unitUids, heroSids };
  const attacker = (visual.boards[meSid] ?? []).find((u) => u.uid === attackerUid);
  if (!attacker) return { unitUids, heroSids };
  const enemies = (visual.boards[enemySid] ?? []).filter((u) => !u.dying);
  const taunts = enemies.filter((u) => u.taunt);
  if (taunts.length > 0) {
    taunts.forEach((u) => unitUids.add(u.uid));
    return { unitUids, heroSids };
  }
  enemies.forEach((u) => unitUids.add(u.uid));
  // 속공 유닛은 소환 턴에 영웅 공격 불가
  if (!attacker.justPlayed) heroSids.add(enemySid);
  return { unitUids, heroSids };
};

/** Does this hand card have any legal use right now? (playability glow) */
export const spellHasTargets = (
  cardId: string,
  meSid: string,
  enemySid: string,
  visual: VisualState | null,
): boolean => {
  const view = cardView(cardId);
  if (view.type !== "spell" || view.target === "none") return true;
  const { unitUids, heroSids } = selectorTargets(view.target, meSid, enemySid, visual);
  return unitUids.size > 0 || heroSids.size > 0;
};
