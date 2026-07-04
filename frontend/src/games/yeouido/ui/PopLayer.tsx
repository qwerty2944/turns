"use client";

export type Pop = {
  id: number;
  x: number;
  y: number;
  n: number;
  kind: "dmg" | "heal";
};

export const PopLayer = ({
  pops,
  onDone,
}: {
  pops: Pop[];
  onDone: (id: number) => void;
}) => (
  <div className="yd-pop-layer">
    {pops.map((p) => (
      <span
        key={p.id}
        className={`yd-pop yd-pop--${p.kind}`}
        style={{ left: p.x, top: p.y }}
        onAnimationEnd={() => onDone(p.id)}
      >
        {p.kind === "dmg" ? `-${p.n}` : `+${p.n}`}
      </span>
    ))}
  </div>
);
