"use client";

import { useEffect, useRef } from "react";
import type { InputAction } from "../model/types";

type Props = {
  enabled: boolean;
  onAction: (a: InputAction) => void;
};

// On-screen D-pad shown on touch/narrow screens. Auto-repeats Left/Right/Down
// while held using DAS 150ms + ARR 33ms (matching keyboard handler timings).
const DAS_MS = 150;
const ARR_MS = 33;
const SOFT_DROP_MS = 33;

export const SoftControls = ({ enabled, onAction }: Props) => {
  const repeaters = useRef(new Map<string, { das: any; arr: any }>());

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      for (const t of repeaters.current.values()) {
        clearTimeout(t.das);
        clearInterval(t.arr);
      }
      repeaters.current.clear();
    };
  }, []);

  const startRepeat = (key: string, action: InputAction, arr = ARR_MS) => {
    if (!enabled) return;
    onAction(action); // fire immediately
    stopRepeat(key);
    const t = { das: null as any, arr: null as any };
    t.das = setTimeout(() => {
      t.arr = setInterval(() => onAction(action), arr);
    }, DAS_MS);
    repeaters.current.set(key, t);
  };

  const stopRepeat = (key: string) => {
    const t = repeaters.current.get(key);
    if (!t) return;
    clearTimeout(t.das);
    clearInterval(t.arr);
    repeaters.current.delete(key);
  };

  const tap = (action: InputAction) => () => enabled && onAction(action);

  // Three rows: top = hold + rotate; middle = left/down/right; bottom = drop.
  return (
    <div className="tetris-soft-controls" aria-hidden={!enabled}>
      <Btn label="HOLD" onPress={tap("hold")} disabled={!enabled} />
      <Btn label="⤺" big onPress={tap("rotateCCW")} disabled={!enabled} />
      <Btn label="⤻" big onPress={tap("rotateCW")} disabled={!enabled} />
      <Btn
        label="◀"
        big
        disabled={!enabled}
        onPressStart={() => startRepeat("left", "left")}
        onPressEnd={() => stopRepeat("left")}
      />
      <Btn
        label="▼"
        big
        disabled={!enabled}
        onPressStart={() => startRepeat("down", "softDrop", SOFT_DROP_MS)}
        onPressEnd={() => stopRepeat("down")}
      />
      <Btn
        label="▶"
        big
        disabled={!enabled}
        onPressStart={() => startRepeat("right", "right")}
        onPressEnd={() => stopRepeat("right")}
      />
      <Btn label="DROP" wide onPress={tap("hardDrop")} disabled={!enabled} />
    </div>
  );
};

type BtnProps = {
  label: string;
  big?: boolean;
  wide?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  onPressStart?: () => void;
  onPressEnd?: () => void;
};

const Btn = ({
  label,
  big,
  wide,
  disabled,
  onPress,
  onPressStart,
  onPressEnd,
}: BtnProps) => {
  return (
    <button
      type="button"
      className={`tetris-soft-btn${big ? " big" : ""}${wide ? " wide" : ""}`}
      disabled={disabled}
      onPointerDown={(e) => {
        if (disabled) return;
        e.preventDefault();
        (e.currentTarget as HTMLButtonElement).setPointerCapture?.(e.pointerId);
        if (onPressStart) onPressStart();
        else if (onPress) onPress();
      }}
      onPointerUp={() => onPressEnd?.()}
      onPointerCancel={() => onPressEnd?.()}
      onPointerLeave={() => onPressEnd?.()}
      onContextMenu={(e) => e.preventDefault()}
      style={{ touchAction: "none", userSelect: "none" }}
    >
      {label}
    </button>
  );
};

export default SoftControls;
