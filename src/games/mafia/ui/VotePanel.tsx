"use client";

import { useState } from "react";
import type { Room } from "@colyseus/sdk";
import type { MafiaPlayerView } from "../model/types";

type Props = {
  room: Room | null;
  meSid: string;
  alive: MafiaPlayerView[];
  myVote: string;
};

export const VotePanel = ({ room, meSid, alive, myVote }: Props) => {
  const [target, setTarget] = useState(myVote);

  const submit = (id: string | null) => {
    if (!room) return;
    setTarget(id ?? "");
    room.send("vote", { targetId: id });
  };

  const me = alive.find((p) => p.sessionId === meSid);
  if (!me) {
    return (
      <div className="panel col">
        <h3 className="title" style={{ margin: 0, fontSize: "1rem" }}>투표</h3>
        <p className="muted" style={{ margin: 0 }}>
          💀 사망한 자는 투표할 수 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="panel col">
      <h3 className="title" style={{ margin: 0, fontSize: "1rem" }}>
        ⚖️ 투표 — 처형할 사람을 지목하세요
      </h3>
      <div className="row" style={{ flexWrap: "wrap", gap: 6 }}>
        {alive
          .filter((p) => p.sessionId !== meSid)
          .map((p) => (
            <button
              key={p.sessionId}
              onClick={() => submit(p.sessionId)}
              style={{
                background: target === p.sessionId ? "var(--accent)" : undefined,
                color: target === p.sessionId ? "var(--bg)" : undefined,
              }}
            >
              {p.nickname}
            </button>
          ))}
        <button onClick={() => submit(null)}>기권</button>
      </div>
    </div>
  );
};
