"use client";

import { useCallback } from "react";
import type { Loc } from "./types";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export type AnimRefs = {
  unitRefs: React.RefObject<Map<string, HTMLDivElement | null>>;
  heroRefs: React.RefObject<Map<string, HTMLDivElement | null>>;
  wrapRef: React.RefObject<HTMLDivElement | null>;
};

/**
 * DOM FLIP attack lunge: windup away from the target → accelerating slam
 * into it → (promise resolves at impact) → eased return. The actual card
 * element moves, Hearthstone-style.
 */
export const useAttackAnim = (refs: AnimRefs) => {
  const elFor = useCallback(
    (loc: Loc): HTMLElement | null => {
      if (loc.hero) return refs.heroRefs.current?.get(loc.sid) ?? null;
      if (loc.uid) return refs.unitRefs.current?.get(loc.uid) ?? null;
      return null;
    },
    [refs.heroRefs, refs.unitRefs],
  );

  /** Center of a loc relative to the battlefield wrap (for Phaser/pops). */
  const anchorFor = useCallback(
    (loc: Loc): { x: number; y: number } | null => {
      const wrap = refs.wrapRef.current;
      const el = elFor(loc);
      if (!wrap || !el) return null;
      const wr = wrap.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      return { x: r.left - wr.left + r.width / 2, y: r.top - wr.top + r.height / 2 };
    },
    [elFor, refs.wrapRef],
  );

  const playAttack = useCallback(
    async (from: Loc, to: Loc): Promise<void> => {
      const el = elFor(from);
      const targetEl = elFor(to);
      if (!el || !targetEl) return;

      const a = el.getBoundingClientRect();
      const b = targetEl.getBoundingClientRect();
      let dx = b.left + b.width / 2 - (a.left + a.width / 2);
      let dy = b.top + b.height / 2 - (a.top + a.height / 2);
      const dist = Math.hypot(dx, dy) || 1;
      const nx = dx / dist;
      const ny = dy / dist;
      // stop at the target's edge so the card visually contacts it
      const contact = Math.min(b.width, b.height) * 0.35;
      dx -= nx * contact;
      dy -= ny * contact;

      el.style.zIndex = "30";
      el.style.position = "relative";
      // 타겟에 넉백 방향을 심어 .yd-hit 키프레임이 밀리는 방향을 알게 한다.
      targetEl.style.setProperty("--kx", `${(nx * 14).toFixed(1)}px`);
      targetEl.style.setProperty("--ky", `${(ny * 14).toFixed(1)}px`);
      // windup — pull back away from the target, wind the shoulders
      el.style.transition = "transform 130ms cubic-bezier(0.3, 0, 0.4, 1)";
      el.style.transform = `translate(${(-nx * 24).toFixed(1)}px, ${(-ny * 24).toFixed(1)}px) scale(1.12) rotate(${nx > 0 ? -6 : 6}deg)`;
      await sleep(140);
      // lunge — hard accelerate into the target
      el.style.transition = "transform 170ms cubic-bezier(0.6, 0, 1, 0.4)";
      el.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(1.08) rotate(${nx > 0 ? 3 : -3}deg)`;
      await sleep(175);
      // impact happens NOW (caller applies damage as we resolve);
      // 60ms hit-stop before the eased return sells the weight.
      setTimeout(() => {
        el.style.transition = "transform 320ms cubic-bezier(0.2, 0.8, 0.25, 1)";
        el.style.transform = "";
      }, 60);
      setTimeout(() => {
        el.style.transition = "";
        el.style.zIndex = "";
        el.style.position = "";
      }, 420);
    },
    [elFor],
  );

  return { playAttack, anchorFor };
};
