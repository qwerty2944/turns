"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { EffectPayload } from "../scene/TetrisEffectsScene";

export type EffectsOverlayHandle = {
  playEffect: (p: EffectPayload) => void;
};

const PhaserEffectsOverlay = forwardRef<EffectsOverlayHandle>(
  function PhaserEffectsOverlay(_props, ref) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const gameRef = useRef<any>(null);
    const sceneRef = useRef<any>(null);
    const [, setReadyTick] = useState(0);
    const queueRef = useRef<EffectPayload[]>([]);

    useImperativeHandle(ref, () => ({
      playEffect(p) {
        if (sceneRef.current?.playEffect) {
          sceneRef.current.playEffect(p);
        } else {
          queueRef.current.push(p);
        }
      },
    }));

    useEffect(() => {
      if (gameRef.current) return; // Strict-mode guard.
      let cancelled = false;

      (async () => {
        const Phaser = (await import("phaser")).default;
        const { TetrisEffectsScene } = await import(
          "../scene/TetrisEffectsScene"
        );
        if (cancelled || !wrapRef.current) return;

        const scene = new TetrisEffectsScene();
        scene.setOnReady(() => {
          if (cancelled) return;
          sceneRef.current = scene;
          setReadyTick((n) => n + 1);
          for (const p of queueRef.current.splice(0)) {
            scene.playEffect(p);
          }
        });

        const w = wrapRef.current.clientWidth || 800;
        const h = wrapRef.current.clientHeight || 480;
        const game = new Phaser.Game({
          type: Phaser.AUTO,
          parent: wrapRef.current,
          transparent: true,
          scale: {
            mode: Phaser.Scale.NONE,
            width: w,
            height: h,
          },
          scene,
        });
        gameRef.current = game;

        const ro = new ResizeObserver((entries) => {
          for (const e of entries) {
            const { width, height } = e.contentRect;
            game.scale.resize(width, height);
          }
        });
        ro.observe(wrapRef.current);
        (game as any)._ro = ro;
      })();

      return () => {
        cancelled = true;
        const g = gameRef.current;
        if (g) {
          if ((g as any)._ro) {
            (g as any)._ro.disconnect();
          }
          g.destroy(true);
          gameRef.current = null;
          sceneRef.current = null;
        }
      };
    }, []);

    return (
      <div
        ref={wrapRef}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 5,
        }}
      />
    );
  },
);

export default PhaserEffectsOverlay;
