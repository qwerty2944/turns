import Phaser from "phaser";

export type TapTargetView = {
  id: number;
  cell: number;
  spawnedAt: number;
  expiresAt: number;
};

export type DodgeBlockView = {
  id: number;
  col: number;
  y: number;
  speed: number;
  spawnedAt: number;
};

export type PlayerView = {
  sessionId: string;
  nickname: string;
  alive: boolean;
  hearts: number;
  score: number;
  holdPos: number;
  holdZoneStart: number;
  holdZoneEnd: number;
  holdCycleId: number;
  tapTargets: TapTargetView[];
  dodgeCol: number;
  dodgeBlocks: DodgeBlockView[];
  lastDamageAt: number;
  /** Estimated server time (ms) — used to interpolate falling blocks between server ticks. */
  serverNowEst?: number;
  /** Current room difficulty (1..6). Used to gate which tasks render. */
  difficulty?: number;
};

export type InputCallbacks = {
  onHoldTap: () => void;
  onTapCell: (cell: number) => void;
  onMoveCol: (col: number) => void;
};

type Theme = {
  bg: number;
  panel: number;
  text: string;
  accent: number;
  danger: number;
  gold: number;
  muted: number;
};

const DEFAULT_THEME: Theme = {
  bg: 0x140d2e,
  panel: 0x21194a,
  text: "#e9e3f5",
  accent: 0x7a3fff,
  danger: 0xff5f70,
  gold: 0xd9b66c,
  muted: 0x6e6794,
};

// Base board dimensions — Phaser canvas scales to fit the wrapper.
export const BOARD_W = 220;
export const BOARD_H = 420;

// Layout regions are fixed in world coords — the canvas height shrinks with
// difficulty (see `viewportHeightFor` + setGameSize), so a 1-task board still
// draws hold at its natural 60px height inside a short canvas.
type Region = { top: number; height: number };
type Layout = { hold: Region; tap: Region | null; dodge: Region | null };

function computeLayout(diff: number): Layout {
  const showTap = diff >= 2;
  const showDodge = diff >= 3;
  return {
    hold: { top: 30, height: 60 },
    tap: showTap ? { top: 110, height: 150 } : null,
    dodge: showDodge ? { top: 280, height: 130 } : null,
  };
}

/** Canvas viewport height (in world px) for a given difficulty / task count.
 *  Trimmed so unused regions don't waste vertical space on the player card. */
export function viewportHeightFor(diff: number): number {
  if (diff < 2) return 110;          // header (30) + hold (60) + bottom hint pad (20)
  if (diff < 3) return 280;          // header + hold + gap + tap
  return BOARD_H;                    // full layout
}

export class PlayerBoardScene extends Phaser.Scene {
  private theme: Theme = DEFAULT_THEME;
  private isLocal: boolean = false;
  private callbacks: InputCallbacks | null = null;
  private view: PlayerView | null = null;

  // ── Display objects ──────────────────────────────────────────────
  private g!: Phaser.GameObjects.Graphics;
  private nicknameText!: Phaser.GameObjects.Text;
  private heartsText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private outOverlay!: Phaser.GameObjects.Graphics;
  private outText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;
  private damageFlash!: Phaser.GameObjects.Rectangle;

  // pointer/swipe tracking for dodge lane
  private pointerStart: { x: number; y: number; t: number } | null = null;
  private lastShownDamageAt = 0;
  private currentHeight = BOARD_H;

  constructor() {
    super("PlayerBoard");
  }

  init(data: {
    theme?: Partial<Theme>;
    isLocal?: boolean;
    callbacks?: InputCallbacks;
  }) {
    if (data?.theme) this.theme = { ...DEFAULT_THEME, ...data.theme };
    this.isLocal = !!data?.isLocal;
    this.callbacks = data?.callbacks ?? null;
  }

  create() {
    this.cameras.main.setBackgroundColor(this.theme.bg);
    this.g = this.add.graphics();

    this.nicknameText = this.add
      .text(8, 6, "", {
        fontFamily: "'Galmuri11', 'Press Start 2P', monospace",
        fontSize: "12px",
        color: this.theme.text,
      })
      .setOrigin(0, 0);

    this.heartsText = this.add
      .text(BOARD_W - 8, 6, "", {
        fontFamily: "'Galmuri11', 'Press Start 2P', monospace",
        fontSize: "12px",
        color: "#ff8896",
      })
      .setOrigin(1, 0);

    this.scoreText = this.add
      .text(BOARD_W / 2, 6, "", {
        fontFamily: "'Galmuri11', 'Press Start 2P', monospace",
        fontSize: "11px",
        color: "#d9b66c",
      })
      .setOrigin(0.5, 0);

    this.hintText = this.add
      .text(BOARD_W / 2, BOARD_H - 6, "", {
        fontFamily: "'Galmuri11', monospace",
        fontSize: "9px",
        color: "#9a92c5",
      })
      .setOrigin(0.5, 1);

    this.damageFlash = this.add
      .rectangle(BOARD_W / 2, BOARD_H / 2, BOARD_W, BOARD_H, this.theme.danger, 0)
      .setOrigin(0.5, 0.5);

    this.outOverlay = this.add
      .graphics()
      .fillStyle(0x000000, 0.55)
      .fillRect(0, 0, BOARD_W, BOARD_H)
      .setVisible(false);
    this.outText = this.add
      .text(BOARD_W / 2, BOARD_H / 2, "OUT", {
        fontFamily: "'Galmuri11', 'Press Start 2P', monospace",
        fontSize: "28px",
        color: "#ff5f70",
      })
      .setOrigin(0.5, 0.5)
      .setVisible(false);

    if (this.isLocal) this.wireInput();
  }

  setPlayerView(v: PlayerView) {
    this.view = v;
  }

  setTheme(theme: Partial<Theme>) {
    this.theme = { ...DEFAULT_THEME, ...theme };
    this.cameras.main.setBackgroundColor(this.theme.bg);
  }

  update(_t: number, _dt: number) {
    const v = this.view;
    if (!v) return;
    const nowMs = Date.now();

    // Resize the canvas to the active region so unused space below the last
    // task isn't visible. PlayerBoardView listens to the same difficulty and
    // shrinks its wrapper aspect-ratio in sync.
    const targetH = viewportHeightFor(v.difficulty ?? 1);
    if (targetH !== this.currentHeight) {
      this.currentHeight = targetH;
      this.scale.resize(BOARD_W, targetH);
      this.cameras.main.setViewport(0, 0, BOARD_W, targetH);
      this.hintText.setPosition(BOARD_W / 2, targetH - 6);
      this.damageFlash.setPosition(BOARD_W / 2, targetH / 2);
      this.damageFlash.setSize(BOARD_W, targetH);
      this.outText.setPosition(BOARD_W / 2, targetH / 2);
    }

    // Header texts
    this.nicknameText.setText(v.nickname || "");
    this.heartsText.setText("❤".repeat(Math.max(0, v.hearts)));
    this.scoreText.setText(`${v.score}점`);
    this.hintText.setText(
      this.isLocal
        ? "스페이스=홀드 · 탭=타깃 · ←→/스와이프=회피"
        : "관전 중",
    );

    // Damage flash (~250ms)
    if (v.lastDamageAt > this.lastShownDamageAt) {
      this.lastShownDamageAt = v.lastDamageAt;
      this.damageFlash.fillAlpha = 0.55;
      this.tweens.add({
        targets: this.damageFlash,
        fillAlpha: 0,
        duration: 280,
        ease: "Cubic.easeOut",
      });
    }

    this.g.clear();
    const layout = computeLayout(v.difficulty ?? 1);
    this.drawHoldBar(v, layout.hold);
    if (layout.tap) this.drawTapGrid(v, nowMs, layout.tap);
    if (layout.dodge) this.drawDodgeLane(v, layout.dodge);

    // OUT overlay
    if (!v.alive) {
      // Redraw OUT overlay to cover the current viewport height (it was sized
      // to BOARD_H on first create but the canvas may have shrunk since).
      this.outOverlay
        .clear()
        .fillStyle(0x000000, 0.55)
        .fillRect(0, 0, BOARD_W, this.currentHeight);
      this.outOverlay.setVisible(true);
      this.outText.setVisible(true);
    } else {
      this.outOverlay.setVisible(false);
      this.outText.setVisible(false);
    }
  }

  // ── Drawing ──────────────────────────────────────────────────────

  private drawHoldBar(v: PlayerView, region: Region) {
    const x = 10;
    const y = region.top;
    const w = BOARD_W - 20;
    const h = region.height;

    // Track
    this.g.fillStyle(this.theme.panel, 1).fillRect(x, y, w, h);
    this.g.lineStyle(1, this.theme.muted, 0.6).strokeRect(x, y, w, h);

    // Target zone
    const zs = x + w * Math.max(0, Math.min(1, v.holdZoneStart));
    const ze = x + w * Math.max(0, Math.min(1, v.holdZoneEnd));
    const zw = Math.max(2, ze - zs);
    this.g.fillStyle(this.theme.gold, 0.45).fillRect(zs, y + 8, zw, h - 16);
    this.g.lineStyle(2, this.theme.gold, 1).strokeRect(zs, y + 8, zw, h - 16);

    // Indicator
    const ix = x + w * Math.max(0, Math.min(1, v.holdPos));
    const inZone = v.holdPos >= v.holdZoneStart && v.holdPos <= v.holdZoneEnd;
    this.g
      .fillStyle(inZone ? this.theme.gold : this.theme.accent, 1)
      .fillRect(ix - 2, y - 4, 4, h + 8);
  }

  private drawTapGrid(v: PlayerView, nowMs: number, region: Region) {
    const x0 = 10;
    const y0 = region.top;
    const w = BOARD_W - 20;
    const h = region.height;
    const cellSize = Math.floor(Math.min(w, h) / 3);
    const gridLeft = x0 + (w - cellSize * 3) / 2;
    const gridTop = y0 + (h - cellSize * 3) / 2;

    // Frame
    this.g
      .fillStyle(this.theme.panel, 0.6)
      .fillRect(x0, y0, w, h);

    // Cells
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const cx = gridLeft + c * cellSize;
        const cy = gridTop + r * cellSize;
        this.g
          .lineStyle(1, this.theme.muted, 0.4)
          .strokeRect(cx + 1, cy + 1, cellSize - 2, cellSize - 2);
      }
    }

    // Active targets
    for (const t of v.tapTargets) {
      const c = t.cell % 3;
      const r = Math.floor(t.cell / 3);
      const cx = gridLeft + c * cellSize + cellSize / 2;
      const cy = gridTop + r * cellSize + cellSize / 2;
      const total = Math.max(1, t.expiresAt - t.spawnedAt);
      const remaining = Math.max(0, t.expiresAt - nowMs);
      const ratio = remaining / total;
      const radius = (cellSize / 2 - 4) * (0.35 + 0.65 * ratio);
      const color =
        ratio < 0.33 ? this.theme.danger : ratio < 0.66 ? this.theme.gold : this.theme.accent;
      this.g.fillStyle(color, 0.9).fillCircle(cx, cy, radius);
      this.g.lineStyle(1, 0xffffff, 0.6).strokeCircle(cx, cy, radius);
    }
  }

  private drawDodgeLane(v: PlayerView, region: Region) {
    const x0 = 10;
    const y0 = region.top;
    const w = BOARD_W - 20;
    const h = region.height;
    const colW = w / 3;

    // Lane background
    this.g.fillStyle(this.theme.panel, 0.6).fillRect(x0, y0, w, h);
    // Column dividers
    for (let i = 1; i < 3; i++) {
      this.g
        .lineStyle(1, this.theme.muted, 0.3)
        .lineBetween(x0 + colW * i, y0 + 4, x0 + colW * i, y0 + h - 4);
    }

    // Falling blocks — interpolate locally using spawnedAt+speed when we have
    // a clock estimate, so motion stays smooth between 20Hz server ticks.
    const now = v.serverNowEst ?? Date.now();
    for (const b of v.dodgeBlocks) {
      const interp = b.speed > 0
        ? Math.max(0, Math.min(1.1, (now - b.spawnedAt) * b.speed))
        : b.y;
      const yRatio = Math.max(b.y, interp);
      const cx = x0 + b.col * colW + colW / 2;
      const cy = y0 + h * Math.max(0, Math.min(1, yRatio));
      const bw = colW - 14;
      const bh = 16;
      this.g.fillStyle(this.theme.danger, 0.95).fillRect(cx - bw / 2, cy - bh / 2, bw, bh);
      this.g
        .lineStyle(1, 0xffffff, 0.5)
        .strokeRect(cx - bw / 2, cy - bh / 2, bw, bh);
    }

    // Character (player)
    const charCx = x0 + v.dodgeCol * colW + colW / 2;
    const charCy = y0 + h * 0.85;
    const cw = colW - 22;
    const ch = 18;
    this.g.fillStyle(this.theme.accent, 1).fillRect(charCx - cw / 2, charCy - ch / 2, cw, ch);
    this.g
      .lineStyle(1.5, 0xffffff, 0.8)
      .strokeRect(charCx - cw / 2, charCy - ch / 2, cw, ch);
    // Eye
    this.g.fillStyle(0xffffff, 1).fillRect(charCx - 3, charCy - 3, 2, 2);
    this.g.fillStyle(0xffffff, 1).fillRect(charCx + 1, charCy - 3, 2, 2);
  }

  // ── Input ────────────────────────────────────────────────────────

  private wireInput() {
    if (!this.callbacks) return;

    // Make scene events camera-relative coords (default)
    this.input.on(
      "pointerdown",
      (pointer: Phaser.Input.Pointer) => {
        this.pointerStart = { x: pointer.x, y: pointer.y, t: pointer.time };
      },
    );

    this.input.on(
      "pointerup",
      (pointer: Phaser.Input.Pointer) => {
        const start = this.pointerStart;
        this.pointerStart = null;
        if (!start || !this.callbacks) return;
        const v = this.view;
        if (!v || !v.alive) return;

        const dx = pointer.x - start.x;
        const dy = pointer.y - start.y;
        const dist = Math.hypot(dx, dy);
        const x = pointer.x;
        const y = pointer.y;

        const layout = computeLayout(v.difficulty ?? 1);
        const inRegion = (r: Region | null) =>
          !!r && y >= r.top && y <= r.top + r.height && x >= 10 && x <= BOARD_W - 10;
        const inHold = inRegion(layout.hold);
        const inTap = inRegion(layout.tap);
        const inDodge = inRegion(layout.dodge);

        if (inHold) {
          this.callbacks.onHoldTap();
          return;
        }

        if (inTap && layout.tap && dist < 12) {
          // Cell hit-testing must mirror the grid math.
          const w = BOARD_W - 20;
          const h = layout.tap.height;
          const cellSize = Math.floor(Math.min(w, h) / 3);
          const gridLeft = 10 + (w - cellSize * 3) / 2;
          const gridTop = layout.tap.top + (h - cellSize * 3) / 2;
          const c = Math.floor((x - gridLeft) / cellSize);
          const r = Math.floor((y - gridTop) / cellSize);
          if (c >= 0 && c < 3 && r >= 0 && r < 3) {
            this.callbacks.onTapCell(r * 3 + c);
            return;
          }
        }

        if (inDodge) {
          // Tap on a column moves directly; swipe left/right also moves.
          if (dist < 12) {
            const w = BOARD_W - 20;
            const colW = w / 3;
            const col = Math.max(0, Math.min(2, Math.floor((x - 10) / colW)));
            this.callbacks.onMoveCol(col);
            return;
          }
          if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 18) {
            const dir = dx > 0 ? 1 : -1;
            const target = Math.max(0, Math.min(2, (v.dodgeCol ?? 1) + dir));
            this.callbacks.onMoveCol(target);
            return;
          }
        }
      },
    );

    // Keyboard (PC) — global, not bound to canvas focus.
    // We add a window-level keydown so the local player can play even when
    // they haven't clicked the canvas first.
    const onKey = (e: KeyboardEvent) => {
      if (!this.callbacks) return;
      const v = this.view;
      if (!v || !v.alive) return;
      if (e.code === "Space") {
        e.preventDefault();
        this.callbacks.onHoldTap();
      } else if (e.code === "ArrowLeft" || e.code === "KeyA") {
        e.preventDefault();
        const target = Math.max(0, (v.dodgeCol ?? 1) - 1);
        this.callbacks.onMoveCol(target);
      } else if (e.code === "ArrowRight" || e.code === "KeyD") {
        e.preventDefault();
        const target = Math.min(2, (v.dodgeCol ?? 1) + 1);
        this.callbacks.onMoveCol(target);
      } else if (e.code.startsWith("Digit")) {
        const n = parseInt(e.code.slice(5), 10);
        if (n >= 1 && n <= 9) {
          // 1..9 maps directly to 3×3 grid cells (row-major).
          this.callbacks.onTapCell(n - 1);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    this.events.once("shutdown", () => {
      window.removeEventListener("keydown", onKey);
    });
    this.events.once("destroy", () => {
      window.removeEventListener("keydown", onKey);
    });
  }
}
