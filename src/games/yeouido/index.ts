import dynamic from "next/dynamic";
import type { GameManifest } from "@/entities/game/model/types";

// Phaser depends on browser globals — load the table only on the client.
const Table = dynamic(() => import("./ui/YeouidoTable"), { ssr: false });

export const yeouidoManifest: GameManifest = {
  id: "yeouido",
  roomName: "yeouido",
  displayName: "여의도 대전",
  description:
    "대한민국 정치 풍자 카드 배틀. 유닛을 소환하고 상대 후보의 지지율을 0으로 만들어 당선되세요.",
  minPlayers: 2,
  maxPlayers: 2,
  available: true,
  Table,
};
