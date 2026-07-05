import dynamic from "next/dynamic";
import type { GameManifest } from "@/entities/game/model/types";

const Table = dynamic(() => import("./ui/MafiaTable"), { ssr: false });

export const mafiaManifest: GameManifest = {
  id: "mafia",
  roomName: "mafia",
  displayName: "타뷸라의 늑대",
  description:
    "어둠 속 늑대를 색출하라. 매 밤 누군가 사라지고, 매 낮 토론과 투표로 처형이 결정된다.",
  minPlayers: 4,
  maxPlayers: 10,
  available: true,
  Table,
};
