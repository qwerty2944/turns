import Phaser from "phaser";

export type Rect = { x: number; y: number; width: number; height: number };

export type EffectPayload =
  | {
      kind: "lineClear";
      board: Rect;
      rows: number[];
      count: number;
    }
  | {
      kind: "attackComet";
      from: Rect;
      to: Rect;
      lines: number;
    }
  | { kind: "topOut"; board: Rect }
  | { kind: "roundWin"; board: Rect };

type Listener = { onReady: () => void };

const FLASH_COLORS: Record<number, number> = {
  1: 0xffffff,
  2: 0xfacc15,
  3: 0xfb923c,
  4: 0xa855f7, // tetris flash leads with purple, rainbow trail follows
};

const SHAKE_INTENSITY: Record<number, { duration: number; force: number }> = {
  1: { duration: 80, force: 0.001 },
  2: { duration: 140, force: 0.003 },
  3: { duration: 200, force: 0.006 },
  4: { duration: 320, force: 0.012 },
};

export class TetrisEffectsScene extends Phaser.Scene {
  private listener: Listener = { onReady: () => {} };
  private booted = false;
  private fx!: Phaser.GameObjects.Container;

  constructor() {
    super("tetris-effects");
  }

  setOnReady(cb: () => void) {
    this.listener = { onReady: cb };
    if (this.booted) cb();
  }

  preload() {
    // Use generated textures only — no external assets needed.
  }

  create() {
    this.fx = this.add.container(0, 0);
    // 1x1 white texture for tinted rects/comet bodies.
    if (!this.textures.exists("px")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xffffff, 1);
      g.fillRect(0, 0, 1, 1);
      g.generateTexture("px", 1, 1);
      g.destroy();
    }
    this.booted = true;
    this.listener.onReady();
  }

  playEffect(p: EffectPayload) {
    if (!this.booted) return;
    switch (p.kind) {
      case "lineClear":
        return this.fxLineClear(p);
      case "attackComet":
        return this.fxComet(p);
      case "topOut":
        return this.fxTopOut(p.board);
      case "roundWin":
        return this.fxRoundWin(p.board);
    }
  }

  // ───────── effects ───────── //

  private fxLineClear(p: Extract<EffectPayload, { kind: "lineClear" }>) {
    const rowH = Math.max(1, p.board.height / 20);
    const flashColor = FLASH_COLORS[Math.min(4, Math.max(1, p.count))] ?? 0xffffff;

    // Per-row flash with stepped 80ms pulse + slide-out.
    for (const r of p.rows) {
      const rect = this.add.rectangle(
        p.board.x + p.board.width / 2,
        p.board.y + r * rowH + rowH / 2,
        p.board.width,
        rowH,
        flashColor,
        0.95,
      );
      rect.setBlendMode(Phaser.BlendModes.ADD);
      this.fx.add(rect);
      this.tweens.add({
        targets: rect,
        alpha: 0,
        scaleY: 0.1,
        duration: 320,
        ease: "Cubic.easeOut",
        onComplete: () => rect.destroy(),
      });

      // Particle burst per cleared row.
      const burst = this.add.particles(0, 0, "px", {
        x: { min: p.board.x, max: p.board.x + p.board.width },
        y: p.board.y + r * rowH + rowH / 2,
        speedY: { min: -120, max: -260 },
        speedX: { min: -80, max: 80 },
        scale: { start: 2, end: 0 },
        tint: flashColor,
        lifespan: 420,
        quantity: 6,
        emitting: false,
      });
      burst.explode(Math.min(28, 8 + p.count * 6));
      this.time.delayedCall(700, () => burst.destroy());
    }

    // Tetris (4) — extra rainbow halo and bigger shake.
    if (p.count >= 4) {
      const halo = this.add.rectangle(
        p.board.x + p.board.width / 2,
        p.board.y + p.board.height / 2,
        p.board.width + 12,
        p.board.height + 12,
        0xffffff,
        0,
      );
      halo.setStrokeStyle(4, 0xff66ff, 1);
      halo.setBlendMode(Phaser.BlendModes.ADD);
      this.fx.add(halo);
      this.tweens.add({
        targets: halo,
        scale: 1.05,
        alpha: { from: 1, to: 0 },
        duration: 520,
        onComplete: () => halo.destroy(),
      });
    }

    const shake = SHAKE_INTENSITY[Math.min(4, Math.max(1, p.count))];
    if (shake) {
      this.cameras.main.shake(shake.duration, shake.force);
    }
  }

  private fxComet(p: Extract<EffectPayload, { kind: "attackComet" }>) {
    const fromX = p.from.x + p.from.width / 2;
    const fromY = p.from.y + p.from.height / 2;
    const toX = p.to.x + p.to.width / 2;
    const toY = p.to.y + p.to.height / 2;

    const comet = this.add.image(fromX, fromY, "px");
    comet.setScale(6);
    comet.setTint(0xff5566);
    comet.setBlendMode(Phaser.BlendModes.ADD);
    this.fx.add(comet);

    const trail = this.add.particles(0, 0, "px", {
      follow: comet,
      tint: [0xffaa00, 0xff5566, 0xffffff],
      scale: { start: 3, end: 0 },
      speed: 30,
      lifespan: 280,
      quantity: 2,
      blendMode: Phaser.BlendModes.ADD,
    });

    this.tweens.add({
      targets: comet,
      x: toX,
      y: toY,
      duration: 520,
      ease: "Quad.easeIn",
      onComplete: () => {
        // Small impact burst.
        const burst = this.add.particles(0, 0, "px", {
          x: toX,
          y: toY,
          tint: 0xff5566,
          scale: { start: 4, end: 0 },
          speed: { min: 60, max: 220 },
          lifespan: 360,
          quantity: 14,
          emitting: false,
          blendMode: Phaser.BlendModes.ADD,
        });
        burst.explode(20);
        this.time.delayedCall(500, () => burst.destroy());
        comet.destroy();
        trail.stop();
        this.time.delayedCall(400, () => trail.destroy());
      },
    });
  }

  private fxTopOut(board: Rect) {
    const overlay = this.add.rectangle(
      board.x + board.width / 2,
      board.y + board.height / 2,
      board.width,
      board.height,
      0xef4444,
      0.55,
    );
    this.fx.add(overlay);
    this.tweens.add({
      targets: overlay,
      alpha: 0,
      duration: 1100,
      onComplete: () => overlay.destroy(),
    });
    this.cameras.main.shake(220, 0.008);
  }

  private fxRoundWin(board: Rect) {
    const cx = board.x + board.width / 2;
    const cy = board.y + board.height / 2;
    const halo = this.add.rectangle(cx, cy, board.width + 24, board.height + 24, 0xffd700, 0);
    halo.setStrokeStyle(6, 0xffd700, 1);
    halo.setBlendMode(Phaser.BlendModes.ADD);
    this.fx.add(halo);
    this.tweens.add({
      targets: halo,
      scale: 1.1,
      alpha: { from: 1, to: 0 },
      duration: 900,
      onComplete: () => halo.destroy(),
    });
    const burst = this.add.particles(0, 0, "px", {
      x: cx,
      y: cy,
      tint: [0xffd700, 0xfacc15, 0xffffff],
      scale: { start: 5, end: 0 },
      speed: { min: 80, max: 280 },
      lifespan: 900,
      quantity: 40,
      emitting: false,
      blendMode: Phaser.BlendModes.ADD,
    });
    burst.explode(60);
    this.time.delayedCall(1200, () => burst.destroy());
  }
}
