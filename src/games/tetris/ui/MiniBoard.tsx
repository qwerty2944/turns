"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { BOARD_H, BOARD_W, PIECE_COLOR, PIECE_SHAPES } from "../model/pieces";
import type { PlayerBoardSnap } from "../model/types";

export type MiniBoardHandle = {
  getRect: () => DOMRect | null;
};

type Props = {
  board: PlayerBoardSnap;
  selected?: boolean;
};

// Tiny canvas (4–6px cells) showing opponent stacks. No ghost, just the
// final cell state + current piece.
export const MiniBoard = forwardRef<MiniBoardHandle, Props>(function MiniBoard(
  { board, selected = false },
  ref,
) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sizeRef = useRef({ cell: 0 });

  useImperativeHandle(ref, () => ({
    getRect: () => canvasRef.current?.getBoundingClientRect() ?? null,
  }));

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const fit = () => {
      const aw = wrap.clientWidth;
      const ah = wrap.clientHeight;
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const cell = Math.max(3, Math.min(
        Math.floor(aw / BOARD_W),
        Math.floor(ah / BOARD_H) || Math.floor(aw / BOARD_W),
      ));
      const pxW = cell * BOARD_W;
      const pxH = cell * BOARD_H;
      canvas.style.width = `${pxW}px`;
      canvas.style.height = `${pxH}px`;
      canvas.width = Math.floor(pxW * dpr);
      canvas.height = Math.floor(pxH * dpr);
      sizeRef.current.cell = cell;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cell = sizeRef.current.cell;
    if (!cell) return;
    const w = cell * BOARD_W;
    const h = cell * BOARD_H;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(8,5,22,0.95)";
    ctx.fillRect(0, 0, w, h);

    // Stack cells.
    for (let y = 0; y < BOARD_H; y++) {
      for (let x = 0; x < BOARD_W; x++) {
        const v = board.cells[y * BOARD_W + x];
        if (!v) continue;
        ctx.fillStyle = PIECE_COLOR[v] ?? "#888";
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }

    // Active piece (omit ghost — too noisy at this size).
    const cur = board.cur;
    if (cur?.type) {
      ctx.fillStyle = PIECE_COLOR[cur.type] ?? "#fff";
      for (const [dx, dy] of (PIECE_SHAPES[cur.type]?.[cur.rot & 3] ?? [])) {
        const cx = cur.x + dx;
        const cy = cur.y + dy;
        if (cy < 0 || cy >= BOARD_H || cx < 0 || cx >= BOARD_W) continue;
        ctx.fillRect(cx * cell, cy * cell, cell, cell);
      }
    }

    if (!board.alive) {
      ctx.fillStyle = "rgba(239,68,68,0.45)";
      ctx.fillRect(0, 0, w, h);
    }
  };

  return (
    <div
      ref={wrapRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 0,
        padding: 6,
        borderRadius: 6,
        border: `1px solid ${selected ? "var(--accent, #facc15)" : "var(--panel-border, rgba(255,255,255,0.15))"}`,
        background: "rgba(0,0,0,0.25)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          fontSize: 11,
          color: board.alive ? "var(--text)" : "var(--danger, #ef4444)",
          gap: 4,
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
            flex: 1,
          }}
          title={board.nickname}
        >
          {board.alive ? "" : "💀 "}
          {board.nickname}
        </span>
        <span style={{ flexShrink: 0, color: "var(--muted, #94a3b8)" }}>
          {board.lines}줄
        </span>
      </div>
      <canvas ref={canvasRef} style={{ imageRendering: "pixelated" }} />
      {board.incomingGarbage > 0 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            background: "linear-gradient(0deg, #ef4444, #facc15)",
            opacity: Math.min(1, 0.3 + board.incomingGarbage / 10),
          }}
        />
      )}
    </div>
  );
});

export default MiniBoard;
