"use client";

import { useThemeStore } from "@/shared/theme/themeStore";

type Props = { compact?: boolean };

export const ThemeSwitcher = ({ compact = false }: Props) => {
  const theme = useThemeStore((s) => s.theme);
  const hydrated = useThemeStore((s) => s.hydrated);
  const toggle = useThemeStore((s) => s.toggle);

  if (!hydrated) return null;
  const isPixel = theme === "pixel";

  return (
    <button
      type="button"
      onClick={toggle}
      className="theme-switcher"
      aria-label={`테마 전환 (현재: ${isPixel ? "픽셀" : "타로"})`}
      title={isPixel ? "타로 테마로" : "픽셀 테마로"}
    >
      <span aria-hidden="true">{isPixel ? "📟" : "🎴"}</span>
      {!compact && <span>{isPixel ? "PIXEL" : "TAROT"}</span>}
    </button>
  );
};
