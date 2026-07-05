import { loveLetterManifest } from "@/games/love-letter";
import { mafiaManifest } from "@/games/mafia";
import { multitaskManifest } from "@/games/multitask";
import { tetrisManifest } from "@/games/tetris";
import { yeouidoManifest } from "@/games/yeouido";
import type { GameManifest } from "./types";

// Add new games here. Each game owns its own slice under src/games/<game-id>/.
export const GAME_REGISTRY: GameManifest[] = [
  loveLetterManifest,
  mafiaManifest,
  multitaskManifest,
  tetrisManifest,
  yeouidoManifest,
];

export const getGame = (id: string) =>
  GAME_REGISTRY.find((g) => g.id === id);

/** Display emoji per game (lobby chips, room list). */
export const GAME_EMOJI: Record<string, string> = {
  love_letter: "💌",
  yeouido: "🏛️",
  mafia: "🐺",
  tetris: "🧱",
  multitask: "🤹",
};
