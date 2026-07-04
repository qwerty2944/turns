"use client";

import { cardArt, cardView } from "../model/cards";
import type { VisualUnit } from "../model/types";

type Props = {
  unit: VisualUnit;
  mine: boolean;
  glowAttack: boolean; // my turn + canAttack
  targetable: boolean;
  selected: boolean;
  registerRef: (el: HTMLDivElement | null) => void;
  onClick: () => void;
};

export const UnitCard = ({
  unit,
  mine,
  glowAttack,
  targetable,
  selected,
  registerRef,
  onClick,
}: Props) => {
  const view = cardView(unit.cardId);
  const classes = [
    "yd-unit",
    unit.taunt ? "yd-unit--taunt" : "",
    glowAttack ? "yd-unit--can-attack" : "",
    targetable ? "yd-unit--targetable" : "",
    selected ? "yd-unit--selected" : "",
    unit.dying ? "yd-unit--dying" : "",
    unit.entering ? "yd-unit--entering" : "",
    unit.justPlayed && !unit.canAttack && mine ? "yd-unit--sleep" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const buffed = unit.maxHp > (view.hp ?? unit.maxHp) || unit.atk > (view.atk ?? unit.atk);

  return (
    <div ref={registerRef} className={classes} onClick={onClick} title={view.name}>
      <div
        key={unit.hitKey ?? 0}
        className={(unit.hitKey ?? 0) > 0 ? "yd-unit-inner yd-hit" : "yd-unit-inner"}
      >
        <div
          className="yd-unit-art"
          style={{ backgroundImage: `url(${cardArt(unit.cardId)})` }}
        />
        <span className="yd-unit-name">{view.name}</span>
        <span className={`yd-stat yd-stat--atk${buffed ? " yd-stat--buffed" : ""}`}>
          {unit.atk}
        </span>
        <span
          className={`yd-stat yd-stat--hp${
            unit.hp < unit.maxHp ? " yd-stat--damaged" : buffed ? " yd-stat--buffed" : ""
          }`}
        >
          {unit.hp}
        </span>
        {unit.silenced && <span className="yd-unit-badge">🤐</span>}
        {!unit.silenced && unit.justPlayed && !unit.canAttack && (
          <span className="yd-unit-badge">💤</span>
        )}
      </div>
    </div>
  );
};
