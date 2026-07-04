"use client";

import { useEffect, useState } from "react";

type Props = {
  isMyTurn: boolean;
  turnEndsAt: number;
  turnMs: number;
  onEndTurn: () => void;
};

export const EndTurnButton = ({
  isMyTurn,
  turnEndsAt,
  turnMs,
  onEndTurn,
}: Props) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  const remaining = Math.max(0, turnEndsAt - now);
  const pct = turnEndsAt > 0 ? Math.max(0, Math.min(1, remaining / turnMs)) : 0;
  const secs = Math.ceil(remaining / 1000);
  const urgent = isMyTurn && pct < 0.2;

  return (
    <button
      className={`yd-endturn${isMyTurn ? " yd-endturn--mine" : ""}${
        urgent ? " yd-endturn--urgent" : ""
      }`}
      disabled={!isMyTurn}
      onClick={onEndTurn}
    >
      <span className="yd-endturn-label">
        {isMyTurn ? "턴 종료" : "상대 턴"}
      </span>
      {turnEndsAt > 0 && <span className="yd-endturn-secs">{secs}초</span>}
      <span className="yd-endturn-bar">
        <span
          className="yd-endturn-fill"
          style={{ width: `${(pct * 100).toFixed(1)}%` }}
        />
      </span>
    </button>
  );
};
