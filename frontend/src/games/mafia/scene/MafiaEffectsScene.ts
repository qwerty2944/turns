import Phaser from "phaser";
import { ROLE_KEY, type Role } from "../model/roles";

export type Anchor = { x: number; y: number };

export type MafiaEffectPayload =
  | { kind: "nightFall" }
  | { kind: "dayBreak" }
  | { kind: "wolfHunt"; target: Anchor }
  | { kind: "doctorSave"; target: Anchor }
  | { kind: "seerGlow"; target: Anchor; isWolf: boolean }
  | { kind: "lynch"; target: Anchor }
  | { kind: "villagerWin" }
  | { kind: "wolfWin" }
  | { kind: "roleReveal"; role: Role; at: Anchor };

type Listener = { onReady: () => void };

export class MafiaEffectsScene extends Phaser.Scene {
  private listener: Listener = { onReady: () => {} };
  private booted = false;

  constructor() {
    super("mafia-effects");
  }

  setOnReady(cb: () => void) {
    this.listener = { onReady: cb };
    if (this.booted) cb();
  }

  preload() {
    for (const key of Object.values(ROLE_KEY)) {
      this.load.image(`role-${key}`, `/games/mafia/${key}.png`);
    }
    this.load.image("role-back", `/games/mafia/back.png`);
  }

  create() {
    this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);
    this.booted = true;
    this.listener.onReady();
  }

  playEffect(p: MafiaEffectPayload) {
    if (!this.booted) return;
    switch (p.kind) {
      case "nightFall":
        return this.fxNightFall();
      case "dayBreak":
        return this.fxDayBreak();
      case "wolfHunt":
        return this.fxWolfHunt(p.target);
      case "doctorSave":
        return this.fxDoctorSave(p.target);
      case "seerGlow":
        return this.fxSeerGlow(p.target, p.isWolf);
      case "lynch":
        return this.fxLynch(p.target);
      case "villagerWin":
        return this.fxVillagerWin();
      case "wolfWin":
        return this.fxWolfWin();
      case "roleReveal":
        return this.fxRoleReveal(p.role, p.at);
    }
  }

  // ─── Effects ─────────────────────────────────────────────────────

  private fxNightFall() {
    const { width, height } = this.scale;
    const overlay = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x1a1338,
      0,
    );
    this.tweens.add({
      targets: overlay,
      fillAlpha: 0.45,
      duration: 600,
      yoyo: true,
      hold: 1200,
      onComplete: () => overlay.destroy(),
    });
    // Rising moon
    const moon = this.add.circle(width / 2, height + 60, 36, 0xfff2c8, 0.95);
    moon.setStrokeStyle(2, 0xfff2c8, 0.4);
    this.tweens.add({
      targets: moon,
      y: 64,
      duration: 1400,
      ease: "Cubic.easeOut",
      onComplete: () => {
        this.tweens.add({
          targets: moon,
          alpha: 0,
          duration: 700,
          onComplete: () => moon.destroy(),
        });
      },
    });
  }

  private fxDayBreak() {
    const { width, height } = this.scale;
    const glow = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0xffd76e,
      0,
    );
    this.tweens.add({
      targets: glow,
      fillAlpha: 0.3,
      duration: 500,
      yoyo: true,
      hold: 900,
      onComplete: () => glow.destroy(),
    });
  }

  private fxWolfHunt(target: Anchor) {
    this.cameras.main.shake(220, 0.006);
    // Three diagonal claw slashes
    for (let i = 0; i < 3; i++) {
      const x = target.x - 40 + i * 28;
      const line = this.add.rectangle(x, target.y, 4, 90, 0xff4d6d, 0.95);
      line.setAngle(20);
      line.setOrigin(0.5, 0);
      line.setScale(1, 0);
      this.tweens.add({
        targets: line,
        scaleY: 1,
        duration: 220,
        delay: i * 80,
        ease: "Quad.easeOut",
        onComplete: () => {
          this.tweens.add({
            targets: line,
            alpha: 0,
            duration: 500,
            onComplete: () => line.destroy(),
          });
        },
      });
    }
    this.burst(target, 0xff4d6d, 12, 1);
  }

  private fxDoctorSave(target: Anchor) {
    const v = this.add.rectangle(target.x, target.y, 8, 40, 0xfff2c8, 1);
    const h = this.add.rectangle(target.x, target.y, 28, 8, 0xfff2c8, 1);
    v.setScale(1, 0);
    h.setScale(0, 1);
    this.tweens.add({
      targets: v,
      scaleY: 1,
      duration: 260,
      ease: "Quad.easeOut",
    });
    this.tweens.add({
      targets: h,
      scaleX: 1,
      duration: 260,
      delay: 80,
      ease: "Quad.easeOut",
      onComplete: () => {
        this.tweens.add({
          targets: [v, h],
          alpha: 0,
          duration: 700,
          delay: 600,
          onComplete: () => {
            v.destroy();
            h.destroy();
          },
        });
      },
    });
    this.burst(target, 0xfff2c8, 14, 1);
  }

  private fxSeerGlow(target: Anchor, isWolf: boolean) {
    const color = isWolf ? 0xff4d6d : 0x6ad1ff;
    const ring = this.add.circle(target.x, target.y, 8, color, 0);
    ring.setStrokeStyle(3, color, 1);
    this.tweens.add({
      targets: ring,
      radius: 60,
      alpha: { from: 1, to: 0 },
      duration: 800,
      ease: "Cubic.easeOut",
      onComplete: () => ring.destroy(),
    });
    this.burst(target, color, 10, 0.9);
  }

  private fxLynch(target: Anchor) {
    this.cameras.main.shake(180, 0.004);
    // Crow-like dark dots scatter outward
    for (let i = 0; i < 14; i++) {
      const dot = this.add.rectangle(target.x, target.y, 6, 6, 0x080510, 1);
      const a = Math.random() * Math.PI * 2;
      const r = 120 + Math.random() * 80;
      this.tweens.add({
        targets: dot,
        x: target.x + Math.cos(a) * r,
        y: target.y + Math.sin(a) * r,
        alpha: 0,
        duration: 600 + Math.random() * 400,
        ease: "Cubic.easeOut",
        onComplete: () => dot.destroy(),
      });
    }
    const fade = this.add.rectangle(target.x, target.y, 120, 160, 0x000000, 0);
    this.tweens.add({
      targets: fade,
      fillAlpha: 0.55,
      duration: 800,
      onComplete: () => {
        this.tweens.add({
          targets: fade,
          alpha: 0,
          duration: 600,
          onComplete: () => fade.destroy(),
        });
      },
    });
  }

  private fxVillagerWin() {
    const { width, height } = this.scale;
    for (let i = 0; i < 70; i++) {
      const x = Math.random() * width;
      const c = this.add.rectangle(
        x,
        -20,
        8,
        12,
        Phaser.Display.Color.RandomRGB(180, 255).color,
        1,
      );
      this.tweens.add({
        targets: c,
        y: height + 40,
        angle: 360,
        duration: 1800 + Math.random() * 1500,
        ease: "Cubic.easeIn",
        onComplete: () => c.destroy(),
      });
    }
  }

  private fxWolfWin() {
    const { width, height } = this.scale;
    const splash = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x6a0d1e,
      0,
    );
    this.tweens.add({
      targets: splash,
      fillAlpha: 0.55,
      duration: 600,
      yoyo: true,
      hold: 800,
      onComplete: () => splash.destroy(),
    });
    this.burst({ x: width / 2, y: height / 2 }, 0xff4d6d, 30, 1.5);
  }

  private fxRoleReveal(_role: Role, at: Anchor) {
    this.burst(at, 0xf5d76e, 18, 1.2);
  }

  private burst(at: Anchor, color: number, count: number, scale = 1) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
      const dot = this.add.rectangle(at.x, at.y, 4, 4, color, 1);
      const r = 50 + Math.random() * 30 * scale;
      this.tweens.add({
        targets: dot,
        x: at.x + Math.cos(angle) * r,
        y: at.y + Math.sin(angle) * r,
        alpha: 0,
        duration: 600,
        ease: "Cubic.easeOut",
        onComplete: () => dot.destroy(),
      });
    }
  }
}
