import Phaser from "phaser";

export type EffectPayload =
  | { kind: "impact"; x: number; y: number; power: number }
  | { kind: "shatter"; x: number; y: number }
  | { kind: "nova"; x: number; y: number; color?: number }
  | { kind: "dust"; x: number; y: number }
  | { kind: "heal"; x: number; y: number }
  | { kind: "confetti" };

type Listener = { onReady: () => void };

export class YeouidoEffectsScene extends Phaser.Scene {
  private listener: Listener = { onReady: () => {} };
  private booted = false;

  constructor() {
    super("yd-effects");
  }

  setOnReady(cb: () => void) {
    this.listener = { onReady: cb };
    if (this.booted) cb();
  }

  create() {
    this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);
    this.booted = true;
    this.listener.onReady();
  }

  playEffect(p: EffectPayload) {
    if (!this.booted) return;
    switch (p.kind) {
      case "impact":
        return this.fxImpact(p.x, p.y, p.power);
      case "shatter":
        return this.fxShatter(p.x, p.y);
      case "nova":
        return this.fxNova(p.x, p.y, p.color ?? 0xc8a5ff);
      case "dust":
        return this.fxDust(p.x, p.y);
      case "heal":
        return this.fxHeal(p.x, p.y);
      case "confetti":
        return this.fxConfetti();
    }
  }

  /** Spark burst + shockwave ring + camera shake, scaled by damage. */
  private fxImpact(x: number, y: number, power: number) {
    const k = Math.min(2.2, 0.8 + power * 0.25);
    // shockwave ring
    const ring = this.add.graphics();
    ring.lineStyle(5, 0xffe08a, 0.95);
    ring.strokeCircle(0, 0, 18);
    ring.setPosition(x, y);
    ring.setScale(0.3);
    this.tweens.add({
      targets: ring,
      scale: 1.9 * k,
      alpha: 0,
      duration: 340,
      ease: "Quad.easeOut",
      onComplete: () => ring.destroy(),
    });
    // sparks
    const count = Math.round(12 * k);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = (90 + Math.random() * 170) * k;
      const len = 6 + Math.random() * 10;
      const spark = this.add.rectangle(x, y, len, 3, i % 3 === 0 ? 0xffffff : 0xffb347, 1);
      spark.rotation = a;
      this.tweens.add({
        targets: spark,
        x: x + Math.cos(a) * speed,
        y: y + Math.sin(a) * speed,
        alpha: 0,
        scaleX: 0.3,
        duration: 300 + Math.random() * 220,
        ease: "Quad.easeOut",
        onComplete: () => spark.destroy(),
      });
    }
    this.cameras.main.shake(140 + power * 20, 0.004 + Math.min(0.012, power * 0.0018));
  }

  /** Dark shards falling with gravity — a unit dying. */
  private fxShatter(x: number, y: number) {
    for (let i = 0; i < 14; i++) {
      const w = 5 + Math.random() * 9;
      const shard = this.add.rectangle(
        x + (Math.random() - 0.5) * 30,
        y + (Math.random() - 0.5) * 40,
        w,
        w,
        i % 4 === 0 ? 0x555566 : 0x2b2b3a,
        1,
      );
      shard.angle = Math.random() * 360;
      this.physics.add.existing(shard);
      const body = shard.body as Phaser.Physics.Arcade.Body;
      body.setGravityY(900);
      body.setVelocity((Math.random() - 0.5) * 260, -120 - Math.random() * 160);
      body.setAngularVelocity((Math.random() - 0.5) * 540);
      this.tweens.add({ targets: shard, alpha: 0, duration: 800, delay: 250 });
      this.time.delayedCall(1100, () => shard.destroy());
    }
    const flash = this.add.circle(x, y, 34, 0xffffff, 0.65);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 1.6,
      duration: 260,
      onComplete: () => flash.destroy(),
    });
  }

  /** Expanding magic ring — spell hit / AoE center. */
  private fxNova(x: number, y: number, color: number) {
    for (let r = 0; r < 3; r++) {
      const ring = this.add.graphics();
      ring.lineStyle(4 - r, color, 0.9 - r * 0.25);
      ring.strokeCircle(0, 0, 22 + r * 14);
      ring.setPosition(x, y);
      ring.setScale(0.3);
      this.tweens.add({
        targets: ring,
        scale: 2.4,
        alpha: 0,
        duration: 480 + r * 120,
        ease: "Cubic.easeOut",
        onComplete: () => ring.destroy(),
      });
    }
    for (let i = 0; i < 16; i++) {
      const a = Math.random() * Math.PI * 2;
      const dot = this.add.circle(x, y, 3, color, 1);
      this.tweens.add({
        targets: dot,
        x: x + Math.cos(a) * (70 + Math.random() * 90),
        y: y + Math.sin(a) * (70 + Math.random() * 90),
        alpha: 0,
        duration: 450 + Math.random() * 250,
        ease: "Quad.easeOut",
        onComplete: () => dot.destroy(),
      });
    }
  }

  /** Small ground puffs — a unit being summoned. */
  private fxDust(x: number, y: number) {
    for (let i = 0; i < 10; i++) {
      const a = Math.PI + Math.random() * Math.PI; // bottom半 arc upward
      const puff = this.add.circle(
        x + (Math.random() - 0.5) * 40,
        y + 30,
        4 + Math.random() * 5,
        0x9a8ec4,
        0.55,
      );
      this.tweens.add({
        targets: puff,
        x: puff.x + Math.cos(a) * 30,
        y: puff.y - 20 - Math.random() * 26,
        alpha: 0,
        scale: 1.8,
        duration: 420 + Math.random() * 200,
        ease: "Quad.easeOut",
        onComplete: () => puff.destroy(),
      });
    }
  }

  /** Rising green plus-sparkles. */
  private fxHeal(x: number, y: number) {
    for (let i = 0; i < 10; i++) {
      const t = this.add
        .text(x + (Math.random() - 0.5) * 50, y + (Math.random() - 0.5) * 30, "+", {
          fontSize: `${12 + Math.random() * 10}px`,
          color: "#7dff9b",
        })
        .setOrigin(0.5);
      this.tweens.add({
        targets: t,
        y: t.y - 40 - Math.random() * 30,
        alpha: 0,
        duration: 600 + Math.random() * 300,
        onComplete: () => t.destroy(),
      });
    }
  }

  /** Full-field confetti — victory. */
  private fxConfetti() {
    const w = this.scale.width;
    for (let i = 0; i < 140; i++) {
      const dot = this.add.rectangle(
        Math.random() * w,
        -20 - Math.random() * 60,
        5 + Math.random() * 5,
        5 + Math.random() * 5,
        Phaser.Display.Color.RandomRGB(140, 255).color,
      );
      dot.angle = Math.random() * 360;
      this.physics.add.existing(dot);
      const body = dot.body as Phaser.Physics.Arcade.Body;
      body.setGravityY(500 + Math.random() * 320);
      body.setVelocity((Math.random() - 0.5) * 160, Math.random() * 80);
      body.setAngularVelocity((Math.random() - 0.5) * 360);
      this.time.delayedCall(2600, () => dot.destroy());
    }
  }
}
