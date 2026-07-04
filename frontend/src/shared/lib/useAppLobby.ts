"use client";

import { useEffect } from "react";
import type { Room } from "@colyseus/sdk";
import { isInApp, postToApp, registerAppCommands } from "./appBridge";

export type AppLobbyPlayer = {
  sid: string;
  nickname: string;
  ready: boolean;
  connected: boolean;
  /** yeouido only — empty for other games. */
  faction?: string;
};

export type AppLobbySnapshot = {
  game: string;
  phase: string;
  meSid: string;
  hostSid: string;
  players: AppLobbyPlayer[];
  log: { ts: number; kind: string; text: string; actor: string }[];
};

/**
 * Wire a game table to the Flutter app's native pre-game lobby: push the
 * normalized lobby snapshot on every change and accept the standard lobby
 * commands (toggleReady/startGame/chat — plus per-game extras).
 */
export const useAppLobby = (
  room: Room | null | undefined,
  snapshot: AppLobbySnapshot | null,
  extraCommands?: Record<string, (payload: unknown) => void>,
) => {
  useEffect(() => {
    if (!room || !isInApp()) return;
    return registerAppCommands({
      toggleReady: () => room.send("toggleReady"),
      startGame: () => room.send("startGame"),
      chat: (p) => {
        if (typeof p === "string" && p.trim()) room.send("chat", p.trim());
      },
      ...(extraCommands ?? {}),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room]);

  useEffect(() => {
    if (!snapshot || !isInApp()) return;
    postToApp("turnsState", snapshot);
  }, [snapshot]);
};
