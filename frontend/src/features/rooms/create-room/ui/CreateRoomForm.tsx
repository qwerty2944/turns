"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { GameManifest } from "@/entities/game/model/types";
import { useAuthStore } from "@/entities/user/model/authStore";

type Props = { games: GameManifest[] };

export const CreateRoomForm = ({ games }: Props) => {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const availableGames = useMemo(() => games.filter((g) => g.available), [games]);
  const firstId = availableGames[0]?.id ?? games[0]?.id ?? "";
  const [gameId, setGameId] = useState(firstId);
  const game = games.find((g) => g.id === gameId) ?? games[0];

  const [roomName, setRoomName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(game?.maxPlayers ?? 2);

  const onGameChange = (id: string) => {
    setGameId(id);
    const next = games.find((g) => g.id === id);
    if (next) setMaxPlayers(next.maxPlayers);
  };

  const onCreate = () => {
    if (!game) return;
    const params = new URLSearchParams({
      mode: "create",
      game: game.id,
      name: roomName || `${user?.nickname ?? "Player"}의 방`,
      max: String(maxPlayers),
    });
    router.push(`/play?${params.toString()}`);
  };

  const playerCounts: number[] = [];
  if (game) {
    for (let n = game.minPlayers; n <= game.maxPlayers; n++) playerCounts.push(n);
  }

  return (
    <div className="panel col">
      <h2 className="title" style={{ margin: 0, fontSize: "1.2rem" }}>방 만들기</h2>
      <div className="row" style={{ flexWrap: "wrap" }}>
        <label className="row muted" style={{ gap: 6 }}>
          게임
          <select
            value={gameId}
            onChange={(e) => onGameChange(e.target.value)}
            style={{
              background: "rgba(13,10,31,0.6)",
              border: "1px solid rgba(217,182,108,0.4)",
              color: "var(--text)",
              padding: "0.4rem",
              borderRadius: 6,
            }}
          >
            {games.map((g) => (
              <option key={g.id} value={g.id} disabled={!g.available}>
                {g.displayName} {!g.available && "(준비중)"}
              </option>
            ))}
          </select>
        </label>
        <input
          placeholder="방 이름"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          maxLength={24}
          style={{ flex: "1 1 200px" }}
        />
        <label className="row muted" style={{ gap: 6 }}>
          인원
          <select
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(Number(e.target.value))}
            style={{
              background: "rgba(13,10,31,0.6)",
              border: "1px solid rgba(217,182,108,0.4)",
              color: "var(--text)",
              padding: "0.4rem",
              borderRadius: 6,
            }}
          >
            {playerCounts.map((n) => (
              <option key={n} value={n}>{n}명</option>
            ))}
          </select>
        </label>
        <button onClick={onCreate} disabled={!game?.available}>만들기</button>
      </div>
      {game && <p className="muted" style={{ margin: 0 }}>{game.description}</p>}
    </div>
  );
};
