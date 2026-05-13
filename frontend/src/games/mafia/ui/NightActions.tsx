"use client";

import { useMemo, useState } from "react";
import type { Room } from "@colyseus/sdk";
import { ROLE, type Role } from "../model/roles";
import type { MafiaPlayerView, SeerResult } from "../model/types";

type Props = {
  room: Room | null;
  role: Role | "";
  meSid: string;
  alive: MafiaPlayerView[];
  wolfIds: Set<string>;
  lastDoctorTarget: string;
  seerResults: SeerResult[];
  submitted: boolean;
  onSubmit: (target: string) => void;
};

export const NightActions = ({
  room,
  role,
  meSid,
  alive,
  wolfIds,
  lastDoctorTarget,
  seerResults,
  submitted,
  onSubmit,
}: Props) => {
  const [target, setTarget] = useState("");

  const selectable = useMemo(() => {
    if (!role) return new Set<string>();
    return new Set(
      alive
        .filter((p) => {
          if (role === ROLE.WOLF) return !wolfIds.has(p.sessionId);
          if (role === ROLE.SEER) return p.sessionId !== meSid;
          if (role === ROLE.DOCTOR) return p.sessionId !== lastDoctorTarget;
          return false;
        })
        .map((p) => p.sessionId),
    );
  }, [role, alive, wolfIds, meSid, lastDoctorTarget]);

  const submit = () => {
    if (!room || !target) return;
    if (role !== ROLE.WOLF && role !== ROLE.DOCTOR && role !== ROLE.SEER) return;
    room.send("nightAction", { kind: role, targetId: target });
    onSubmit(target);
  };

  if (!role) return null;
  if (role === ROLE.VILLAGER) {
    return (
      <div className="panel col">
        <h3 className="title" style={{ margin: 0, fontSize: "1rem" }}>
          밤
        </h3>
        <p className="muted" style={{ margin: 0 }}>
          🌾 시민에게는 밤 능력이 없습니다. 살아 남은 자들의 결정을 지켜보세요.
        </p>
      </div>
    );
  }

  const labels: Record<Exclude<Role, "villager">, string> = {
    wolf: "🐺 사냥할 대상 선택",
    doctor: "⚕️ 보호할 대상 선택",
    seer: "🔮 정체를 알아낼 대상 선택",
  };

  return (
    <div className="panel col">
      <h3 className="title" style={{ margin: 0, fontSize: "1rem" }}>
        {labels[role as Exclude<Role, "villager">]}
      </h3>
      <div
        className="row"
        style={{ flexWrap: "wrap", gap: 6 }}
      >
        {alive
          .filter((p) => selectable.has(p.sessionId))
          .map((p) => (
            <button
              key={p.sessionId}
              onClick={() => setTarget(p.sessionId)}
              style={{
                background: target === p.sessionId ? "var(--accent)" : undefined,
                color: target === p.sessionId ? "var(--bg)" : undefined,
              }}
              disabled={submitted}
            >
              {p.nickname}
            </button>
          ))}
        {alive.filter((p) => selectable.has(p.sessionId)).length === 0 && (
          <span className="muted">선택할 수 있는 대상이 없습니다</span>
        )}
      </div>
      <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
        {submitted && <span className="muted">✓ 제출됨</span>}
        <button onClick={submit} disabled={!target || submitted}>
          확정
        </button>
      </div>
      {role === ROLE.SEER && seerResults.length > 0 && (
        <div className="col" style={{ gap: 4, fontSize: 13 }}>
          <span className="muted">📜 조사 기록</span>
          {seerResults.map((r) => (
            <span key={`${r.dayCount}-${r.targetId}`}>
              {r.dayCount}일차 — <strong>{r.nickname}</strong>:{" "}
              {r.isWolf ? "🐺 늑대" : "🌾 늑대 아님"}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
