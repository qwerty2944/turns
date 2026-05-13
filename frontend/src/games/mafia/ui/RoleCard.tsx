"use client";

import {
  ROLE_DESC_KR,
  ROLE_EMOJI,
  ROLE_KEY,
  ROLE_NAMES_KR,
  type Role,
} from "../model/roles";

type Props = {
  role: Role;
  size?: number;
  caption?: string;
};

export const RoleCard = ({ role, size = 180, caption }: Props) => {
  const key = ROLE_KEY[role];
  const w = size;
  const h = Math.round(size * 1.4);
  return (
    <div
      className="no-pixelate"
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div
        style={{
          width: w,
          height: h,
          backgroundImage: `url(/games/mafia/${key}.png), linear-gradient(160deg, rgba(40,25,80,0.8), rgba(20,12,38,0.9))`,
          backgroundSize: "cover, cover",
          backgroundPosition: "center, center",
          border: "2px solid var(--accent)",
          borderRadius: "var(--radius)",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          padding: 8,
          imageRendering: "auto" as const,
          fontSize: w * 0.35,
          color: "var(--accent)",
          textShadow: "0 0 6px rgba(0,0,0,0.85)",
          boxShadow: "0 0 24px rgba(245,215,110,0.25)",
        }}
      >
        {/* Fallback emoji shown if image is missing (broken-img stays invisible because background-image is used) */}
        <span aria-hidden="true">{ROLE_EMOJI[role]}</span>
      </div>
      <div
        style={{
          textAlign: "center",
          fontFamily: "var(--font-display)",
          fontSize: 14,
          color: "var(--accent)",
        }}
      >
        {ROLE_NAMES_KR[role]}
      </div>
      {caption !== undefined ? (
        <p className="muted" style={{ margin: 0, fontSize: 13, textAlign: "center", maxWidth: w * 1.6 }}>
          {caption}
        </p>
      ) : (
        <p className="muted" style={{ margin: 0, fontSize: 13, textAlign: "center", maxWidth: w * 1.6 }}>
          {ROLE_DESC_KR[role]}
        </p>
      )}
    </div>
  );
};
