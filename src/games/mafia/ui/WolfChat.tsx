"use client";

import { useEffect, useRef, useState } from "react";
import type { Room } from "@colyseus/sdk";
import type { WolfChatMessage } from "../model/types";

type Props = {
  room: Room | null;
  enabled: boolean;
  messages: WolfChatMessage[];
};

export const WolfChat = ({ room, enabled, messages }: Props) => {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!room || !input.trim()) return;
    room.send("wolfChat", input.trim());
    setInput("");
  };

  return (
    <div className="panel col" style={{ gap: 8, borderColor: "#ff4d6d" }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h3 className="title" style={{ margin: 0, fontSize: "1rem", color: "#ff8da1" }}>
          🐺 늑대 채팅
        </h3>
        {!enabled && <span className="muted" style={{ fontSize: 12 }}>밤에만 활성</span>}
      </div>
      <div
        ref={scrollRef}
        style={{
          maxHeight: 160,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          fontSize: 13,
        }}
      >
        {messages.length === 0 ? (
          <span className="muted">동료들과 다음 사냥감을 의논하세요</span>
        ) : (
          messages.map((m, i) => (
            <div key={`${m.ts}-${i}`}>
              <span className="muted" style={{ fontSize: 11, marginRight: 6 }}>
                {new Date(m.ts).toLocaleTimeString().slice(0, 5)}
              </span>
              <strong style={{ color: "#ff8da1" }}>{m.fromNickname}</strong>: {m.text}
            </div>
          ))
        )}
      </div>
      <form className="row" style={{ gap: 8 }} onSubmit={send}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={enabled ? "늑대들에게만 보임…" : "밤이 되면 활성화됩니다"}
          maxLength={160}
          disabled={!enabled}
        />
        <button type="submit" disabled={!enabled || !input.trim()}>
          전송
        </button>
      </form>
    </div>
  );
};
