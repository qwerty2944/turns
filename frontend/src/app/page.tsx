"use client";

import Link from "next/link";
import { useAuthStore } from "@/entities/user/model/authStore";
import { GAME_REGISTRY } from "@/entities/game/model/registry";
import { ThemeSwitcher } from "@/features/theme-switcher/ui/ThemeSwitcher";

export default function Home() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);
  const authed = hydrated && !!token;

  const primaryHref = authed ? "/lobby" : "/signup";
  const primaryLabel = authed ? "▶ START" : "▶ NEW GAME";

  return (
    <main className="landing">
      <div className="landing-stars" aria-hidden="true" />
      <div className="landing-inner">
        <header className="landing-header">
          <span className="landing-brand">TURNS</span>
          <ThemeSwitcher />
        </header>

        <section className="landing-hero">
          <h1 className="landing-title">TURNS</h1>
          <p className="landing-sub">PIXEL × TAROT · TURN-BASED BOARD GAMES</p>
          <div className="landing-cta">
            <Link href={primaryHref}>
              <button className="pixel-btn primary">{primaryLabel}</button>
            </Link>
            {!authed && (
              <Link href="/login">
                <button className="pixel-btn">CONTINUE</button>
              </Link>
            )}
            {authed && (
              <Link href="/account">
                <button className="pixel-btn">ACCOUNT</button>
              </Link>
            )}
          </div>
        </section>

        <section className="landing-games">
          {GAME_REGISTRY.map((g) => (
            <div
              key={g.id}
              className={`panel landing-game-card${g.available ? "" : " unavailable"}`}
            >
              <h3>{g.displayName}</h3>
              <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
                {g.description}
              </p>
              <span className="meta">
                {g.minPlayers}–{g.maxPlayers} 인 · {g.available ? "PLAYABLE" : "COMING SOON"}
              </span>
            </div>
          ))}
        </section>

        <footer className="landing-footer">
          © 2026 · turns · turn-based room matchmaking
        </footer>
      </div>
    </main>
  );
}
