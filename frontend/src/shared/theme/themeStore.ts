import { create } from "zustand";

// One pixel theme, several color palettes.
export const THEMES = [
  { id: "pixel", label: "옐로우", emoji: "🟡" },
  { id: "pixel-mint", label: "민트", emoji: "🟢" },
  { id: "pixel-rose", label: "로즈", emoji: "🌸" },
  { id: "pixel-amber", label: "앰버", emoji: "🟠" },
  { id: "pixel-mono", label: "게임보이", emoji: "🎮" },
] as const;

export type Theme = (typeof THEMES)[number]["id"];

const STORAGE_KEY = "turns_theme";
const DEFAULT_THEME: Theme = "pixel";

const isTheme = (s: string): s is Theme => THEMES.some((t) => t.id === s);

const applyTheme = (t: Theme) => {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", t);
  }
};

type ThemeState = {
  theme: Theme;
  hydrated: boolean;
  hydrate: () => void;
  setTheme: (t: Theme) => void;
  cycle: () => void;
};

const readStored = (): Theme => {
  if (typeof window === "undefined") return DEFAULT_THEME;
  const raw = window.localStorage.getItem(STORAGE_KEY) ?? "";
  return isTheme(raw) ? raw : DEFAULT_THEME;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: DEFAULT_THEME,
  hydrated: false,
  hydrate: () => {
    const theme = readStored();
    applyTheme(theme);
    set({ theme, hydrated: true });
  },
  setTheme: (t) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, t);
    }
    applyTheme(t);
    set({ theme: t });
  },
  cycle: () => {
    const cur = get().theme;
    const idx = THEMES.findIndex((t) => t.id === cur);
    const next = THEMES[(idx + 1) % THEMES.length].id;
    get().setTheme(next);
  },
}));
