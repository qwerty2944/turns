"use client";

import { ROLE_EMOJI, ROLE_NAMES_KR, type Role } from "../model/roles";
import type { MafiaPlayerView } from "../model/types";

type Props = {
  players: MafiaPlayerView[];
  meSid: string;
  selectableIds?: Set<string>;
  selectedId?: string;
  onPick?: (sessionId: string) => void;
  highlightWolfIds?: Set<string>; // mark wolves to wolf viewers
  badgeFor?: (p: MafiaPlayerView) => React.ReactNode;
  seatRefs?: React.MutableRefObject<Map<string, HTMLDivElement | null>>;
  voteCounts?: Map<string, number>;
};

export const SeatGrid = ({
  players,
  meSid,
  selectableIds,
  selectedId,
  onPick,
  highlightWolfIds,
  badgeFor,
  seatRefs,
  voteCounts,
}: Props) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: 12,
      }}
    >
      {players.map((p) => {
        const dead = !p.alive;
        const selectable = selectableIds?.has(p.sessionId) ?? false;
        const selected = selectedId === p.sessionId;
        const wolfMark = highlightWolfIds?.has(p.sessionId);
        const revealed = (p.revealedRole as Role) || "";
        const votes = voteCounts?.get(p.sessionId) ?? 0;
        return (
          <div
            key={p.sessionId}
            ref={(el) => {
              if (seatRefs) seatRefs.current.set(p.sessionId, el);
            }}
            onClick={() => {
              if (selectable && onPick) onPick(p.sessionId);
            }}
            style={{
              padding: "12px 10px",
              border: selected
                ? "2px solid var(--accent-strong)"
                : wolfMark
                  ? "2px solid #ff4d6d"
                  : "2px solid var(--panel-border)",
              borderRadius: "var(--radius)",
              background: dead ? "rgba(0,0,0,0.35)" : "var(--panel-2)",
              opacity: dead ? 0.55 : 1,
              cursor: selectable ? "pointer" : "default",
              boxShadow: selected ? "0 0 0 2px var(--accent-strong)" : "none",
              transition: "transform 0.08s ease, border-color 0.12s ease",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              textAlign: "center",
              minHeight: 84,
            }}
            onMouseEnter={(e) => {
              if (selectable) e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "";
            }}
          >
            <div style={{ fontSize: 22 }} aria-hidden="true">
              {dead ? "💀" : wolfMark ? "🐺" : "🪪"}
            </div>
            <strong style={{ fontSize: 14, color: "var(--text)" }}>
              {p.sessionId === meSid ? "나" : p.nickname}
              {p.sessionId === meSid && ` (${p.nickname})`}
            </strong>
            {!p.connected && (
              <span className="muted" style={{ fontSize: 11 }}>
                🔌 끊김
              </span>
            )}
            {revealed && (
              <span className="muted" style={{ fontSize: 12 }}>
                {ROLE_EMOJI[revealed]} {ROLE_NAMES_KR[revealed]}
              </span>
            )}
            {badgeFor?.(p)}
            {votes > 0 && (
              <span
                className="muted"
                style={{
                  fontSize: 11,
                  color: "var(--accent)",
                  fontFamily: "var(--font-display)",
                }}
              >
                ▼ {votes}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
