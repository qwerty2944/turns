"use client";

import { useEffect, useRef, useState } from "react";
import { THEMES, useThemeStore } from "@/shared/theme/themeStore";

type Props = { compact?: boolean };

export const ThemeSwitcher = ({ compact = false }: Props) => {
  const theme = useThemeStore((s) => s.theme);
  const hydrated = useThemeStore((s) => s.hydrated);
  const setTheme = useThemeStore((s) => s.setTheme);

  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

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
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            zIndex: 30,
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(120px, 1fr))",
            gap: 4,
            padding: 6,
            background: "var(--panel)",
            border: "2px solid var(--panel-border)",
            borderRadius: "var(--radius)",
            boxShadow: "var(--shadow-stepped)",
            minWidth: 240,
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
