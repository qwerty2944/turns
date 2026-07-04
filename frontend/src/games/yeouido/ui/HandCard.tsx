"use client";

import { cardArt, cardView } from "../model/cards";

type Props = {
  cardId: string;
  playable: boolean;
  selected: boolean;
  onClick: () => void;
  /** Compact frame (deck preview in lobby). */
  small?: boolean;
};

export const HandCard = ({ cardId, playable, selected, onClick, small }: Props) => {
  const view = cardView(cardId);
  const classes = [
    "yd-card",
    small ? "yd-card--small" : "",
    playable ? "yd-card--playable" : "",
    selected ? "yd-card--selected" : "",
    view.faction ? `yd-card--${view.faction}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} onClick={onClick} title={view.name}>
      <span className="yd-card-cost">{view.cost}</span>
      <div className="yd-card-art" style={{ backgroundImage: `url(${cardArt(cardId)})` }} />
      <div className="yd-card-name">{view.name}</div>
      {!small && (
        <div className="yd-card-body">
          {view.text && <div className="yd-card-text">{view.text}</div>}
          {!view.text && view.flavor && (
            <div className="yd-card-text yd-card-flavor">{view.flavor}</div>
          )}
        </div>
      )}
      {view.type === "unit" && (
        <>
          <span className="yd-stat yd-stat--atk">{view.atk}</span>
          <span className="yd-stat yd-stat--hp">{view.hp}</span>
        </>
      )}
      {!small && (
        <span className="yd-tooltip" role="tooltip">
          <span className="yd-tooltip-name">
            ({view.cost}) {view.name}
            {view.type === "unit" ? ` · ${view.atk}/${view.hp}` : ""}
          </span>
          {view.text && <span className="yd-tooltip-text">{view.text}</span>}
          {view.flavor && (
            <span className="yd-tooltip-flavor">{view.flavor}</span>
          )}
        </span>
      )}
    </button>
  );
};
