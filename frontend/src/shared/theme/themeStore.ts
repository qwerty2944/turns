import { create } from "zustand";

export type Theme = "pixel" | "tarot";

const STORAGE_KEY = "turns_theme";
const DEFAULT_THEME: Theme = "pixel";

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
  toggle: () => void;
};

const readStored = (): Theme => {
  if (typeof window === "undefined") return DEFAULT_THEME;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw === "tarot" || raw === "pixel" ? raw : DEFAULT_THEME;
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
  toggle: () => {
    const next: Theme = get().theme === "pixel" ? "tarot" : "pixel";
    get().setTheme(next);
  },
}));
