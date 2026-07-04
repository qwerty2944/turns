"use client";

import { useEffect, useState } from "react";

type Props = {
  isMyTurn: boolean;
  turnEndsAt: number;
  turnMs: number;
  disabled: boolean;
  onEndTurn: () => void;
};

export const EndTurnButton = ({
  isMyTurn,
  turnEndsAt,
  turnMs,
  disabled,
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

  return (
    <button
      className={`yd-endturn${isMyTurn ? " yd-endturn--mine" : ""}${
        isMyTurn && pct < 0.2 ? " yd-endturn--urgent" : ""
      }`}
      style={{ "--pct": `${(pct * 100).toFixed(1)}%` } as React.CSSProperties}
      disabled={!isMyTurn || disabled}
      onClick={onEndTurn}
      title={turnEndsAt > 0 ? `${secs}초 남음` : undefined}
    >
      {isMyTurn ? "턴 종료" : "상대 턴"}
      {turnEndsAt > 0 && <span className="yd-endturn-secs">{secs}s</span>}
    </button>
  );
};
