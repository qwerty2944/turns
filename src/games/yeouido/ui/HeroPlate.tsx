"use client";

import { FACTION_META } from "../model/cards";
import type { PlayerSnap } from "../model/types";

type Props = {
  player: PlayerSnap;
  visualHp: number;
  hitKey: number;
  mine: boolean;
  isTurn: boolean;
  targetable: boolean;
  heroPowerUsable: boolean;
  registerRef: (el: HTMLDivElement | null) => void;
  onClick: () => void;
  onHeroPower: () => void;
};

export const HeroPlate = ({
  player,
  visualHp,
  hitKey,
  mine,
  isTurn,
  targetable,
  heroPowerUsable,
  registerRef,
  onClick,
  onHeroPower,
}: Props) => {
  const meta =
    FACTION_META[(player.faction as "ruling" | "opposition") || "ruling"];
  const classes = [
    "yd-hero",
    `yd-hero--${player.faction || "ruling"}`,
    isTurn ? "yd-hero--turn" : "",
    targetable ? "yd-hero--targetable" : "",
    visualHp <= 10 ? "yd-hero--danger" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <div
        ref={registerRef}
        className="yd-hero-portrait-wrap"
        onClick={onClick}
      >
        <div key={hitKey} className={hitKey > 0 ? "yd-hero-portrait yd-hit" : "yd-hero-portrait"}>
          <div
            className="yd-hero-face"
            style={{ backgroundImage: `url(/games/yeouido/${meta.artKey}.png)` }}
          />
          <span className="yd-hero-hp">{visualHp}</span>
        </div>
      </div>

      <div className="yd-hero-info">
        <div className="yd-hero-name">
          {meta.heroName}
          <span className="yd-hero-nick"> · {player.nickname}</span>
          {!player.connected && " ⚡"}
        </div>
        <div className="yd-mana-row" title={`정치자금 ${player.mana}/${player.manaMax}`}>
          {Array.from({ length: player.manaMax }, (_, i) => (
            <span
              key={i}
              className={`yd-mana-gem${i < player.mana ? " yd-mana-gem--filled" : ""}`}
            />
          ))}
          <span className="yd-mana-label">
            {player.mana}/{player.manaMax}
          </span>
        </div>
        <div className="yd-hero-counts">
          <span title="덱">📦 {player.deckCount}</span>
          <span title="손패">🃏 {player.handCount}</span>
          {player.fatigue > 0 && <span title="탈진">☠ {player.fatigue}</span>}
        </div>
      </div>

      {mine && (
        <button
          className={`yd-heropower${player.heroPowerUsed ? " yd-heropower--used" : ""}`}
          disabled={!heroPowerUsable}
          onClick={onHeroPower}
          title={`${meta.heroPowerName} — ${meta.heroPowerText}`}
        >
          <span className="yd-heropower-cost">2</span>
          <span className="yd-heropower-name">{meta.heroPowerName}</span>
        </button>
      )}
    </div>
  );
};
