"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "../api";
import { recentEmails } from "../lib/recentEmails";
import { extractApiError } from "@/shared/api/axios";
import { PasswordInput } from "@/shared/ui/PasswordInput";
import { Spinner } from "@/shared/ui/Spinner";

export const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { mutate, isPending } = useLoginMutation();
  const [error, setError] = useState("");

  const [recent, setRecent] = useState<string[]>([]);
  const [emailFocused, setEmailFocused] = useState(false);
  const emailWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRecent(recentEmails.list());
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!emailFocused) return;
    const onDown = (e: MouseEvent) => {
      if (!emailWrapRef.current?.contains(e.target as Node)) setEmailFocused(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [emailFocused]);

  const filtered = recent.filter(
    (r) => !email || (r.includes(email.toLowerCase()) && r !== email.toLowerCase()),
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    mutate(
      { email, password },
      {
        onSuccess: () => {
          recentEmails.add(email);
          router.replace("/lobby");
        },
        onError: (err) => setError(extractApiError(err)),
      },
    );
  };

  const removeRecent = (e: React.MouseEvent, addr: string) => {
    e.preventDefault();
    e.stopPropagation();
    recentEmails.remove(addr);
    setRecent(recentEmails.list());
  };

  return (
    <div className="auth-card">
      <div className="auth-logo">
        <span className="auth-logo-emoji">🃏🎲</span>
        <div className="auth-logo-text">턴 즈</div>
        <div className="auth-logo-sub">─ 보드게임 온라인 매칭 ─</div>
      </div>
      <div className="panel col">
      <form className="col" onSubmit={onSubmit}>
        <label className="col" style={{ gap: 4 }}>
          <span className="auth-field-label">◆ 이메일</span>
          <div ref={emailWrapRef} style={{ position: "relative" }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailFocused(true)}
              autoComplete="off"
              required
            />
            {emailFocused && filtered.length > 0 && (
              <div
                role="listbox"
                style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  left: 0,
                  right: 0,
                  zIndex: 20,
                  display: "flex",
                  flexDirection: "column",
                  background: "var(--panel)",
                  border: "2px solid var(--panel-border)",
                  borderRadius: "var(--radius)",
                  boxShadow: "var(--shadow-stepped)",
                  overflow: "hidden",
                }}
              >
                <div
                  className="muted"
                  style={{
                    fontSize: 11,
                    padding: "4px 8px",
                    borderBottom: "1px solid var(--panel-border)",
                  }}
                >
                  최근 로그인
                </div>
                {filtered.map((addr) => (
                  <div
                    key={addr}
                    role="option"
                    aria-selected={false}
                    onMouseDown={(e) => {
                      // Use onMouseDown so click fires before input blur
                      e.preventDefault();
                      setEmail(addr);
                      setEmailFocused(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "6px 8px",
                      cursor: "pointer",
                      background: "transparent",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--panel-2)")
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{ fontSize: 14 }}>{addr}</span>
                    <button
                      type="button"
                      onMouseDown={(e) => removeRecent(e, addr)}
                      aria-label={`${addr} 삭제`}
                      style={{
                        background: "transparent",
                        border: "none",
                        boxShadow: "none",
                        padding: "2px 6px",
                        color: "var(--muted)",
                        fontSize: 14,
                        lineHeight: 1,
                        cursor: "pointer",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </label>
        <label className="col" style={{ gap: 4 }}>
          <span className="auth-field-label">◆ 비밀번호</span>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <div className="error">{error}</div>}
        <button type="submit" className="auth-submit" disabled={isPending}>
          {isPending ? <Spinner size={14} label="접속 중…" /> : "▶ 게임 시작"}
        </button>
      </form>
      <div className="auth-foot">
        처음이신가요? <Link href="/signup">+ 새 계정 만들기</Link>
      </div>
      </div>
      <div className="auth-hint">앱 유저와 같은 방에서 만나요 · 크로스플레이 지원</div>
    </div>
  );
};
