"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { THEMES, useThemeStore } from "@/shared/theme/themeStore";

type Props = { compact?: boolean };

export const ThemeSwitcher = ({ compact = false }: Props) => {
  const theme = useThemeStore((s) => s.theme);
  const hydrated = useThemeStore((s) => s.hydrated);
  const setTheme = useThemeStore((s) => s.setTheme);

  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  // Viewport-fixed coords for the dropdown so it can never clip the screen
  // when the trigger button sits near the left edge (mobile after row-wrap).
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t)) return;
      if (popoverRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // Measure button + popover and clamp horizontally inside the viewport.
  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }
    const margin = 8;
    const place = () => {
      const wrap = wrapRef.current;
      const pop = popoverRef.current;
      if (!wrap || !pop) return;
      const btn = wrap.getBoundingClientRect();
      const popW = pop.offsetWidth;
      const vw = window.innerWidth;
      // Prefer right-aligned (popover's right edge matches button's right edge);
      // fall back to clamping inside the viewport if that overflows.
      let left = btn.right - popW;
      if (left < margin) left = margin;
      if (left + popW > vw - margin) left = Math.max(margin, vw - popW - margin);
      const top = btn.bottom + 6;
      setCoords({ top, left });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, narrow]);

  if (!hydrated) return null;
  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  return (
    <div ref={wrapRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="theme-switcher"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`테마 전환 (현재: ${current.label})`}
        title={current.label}
      >
        <span aria-hidden="true">{current.emoji}</span>
        {!compact && <span>{current.label}</span>}
      </button>
      {open && (
        <div
          ref={popoverRef}
          role="listbox"
          style={{
            position: "fixed",
            top: coords?.top ?? -9999,
            left: coords?.left ?? -9999,
            // Hide popover off-screen until the first layout pass measures it,
            // so users don't see a single-frame flash at the wrong position.
            visibility: coords ? "visible" : "hidden",
            zIndex: 100,
            display: "grid",
            gridTemplateColumns: narrow
              ? "minmax(140px, 1fr)"
              : "repeat(2, minmax(120px, 1fr))",
            gap: 4,
            padding: 6,
            background: "var(--panel)",
            border: "2px solid var(--panel-border)",
            borderRadius: "var(--radius)",
            boxShadow: "var(--shadow-stepped)",
            minWidth: narrow ? 160 : 240,
            maxWidth: "calc(100vw - 16px)",
          }}
        >
          {THEMES.map((t) => {
            const active = t.id === theme;
            return (
              <button
                key={t.id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  setTheme(t.id);
                  setOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "0.4rem 0.6rem",
                  fontSize: "0.8em",
                  borderWidth: 1,
                  background: active ? "var(--accent)" : "var(--panel-2)",
                  color: active ? "var(--bg)" : "var(--text)",
                  boxShadow: "none",
                }}
              >
                <span aria-hidden="true">{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
