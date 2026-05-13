"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "../api";
import { recentEmails } from "../lib/recentEmails";
import { extractApiError } from "@/shared/api/axios";
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
    <div className="panel col">
      <h1 className="title" style={{ margin: 0 }}>Turns</h1>
      <p className="muted" style={{ marginTop: -8 }}>보드게임 매칭</p>
      <form className="col" onSubmit={onSubmit}>
        <label className="col" style={{ gap: 4 }}>
          <span className="muted">이메일</span>
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
          <span className="muted">비밀번호</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={isPending}>
          {isPending ? <Spinner size={14} label="로그인 중…" /> : "로그인"}
        </button>
      </form>
      <div className="muted">
        계정이 없나요? <Link href="/signup">회원가입</Link>
      </div>
    </div>
  );
};
