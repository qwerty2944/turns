import { loveLetterManifest } from "@/games/love-letter";
import { mafiaManifest } from "@/games/mafia";
import type { GameManifest } from "./types";

// Add new games here. Each game owns its own slice under src/games/<game-id>/.
export const GAME_REGISTRY: GameManifest[] = [loveLetterManifest, mafiaManifest];

export const getGame = (id: string) =>
  GAME_REGISTRY.find((g) => g.id === id);
