"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignupMutation } from "../api";
import { extractApiError } from "@/shared/api/axios";
import { PasswordInput } from "@/shared/ui/PasswordInput";
import { Spinner } from "@/shared/ui/Spinner";

export const SignupForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const { mutate, isPending } = useSignupMutation();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다");
      return;
    }
    mutate(
      { email, password, passwordConfirm, nickname },
      {
        onSuccess: () => router.replace("/lobby"),
        onError: (err) => setError(extractApiError(err)),
      },
    );
  };

  return (
    <div className="auth-card">
      <div className="auth-logo">
        <span className="auth-logo-emoji">🃏🎲</span>
        <div className="auth-logo-text">턴 즈</div>
        <div className="auth-logo-sub">─ 새 플레이어 등록 ─</div>
      </div>
      <div className="panel col">
      <form className="col" onSubmit={onSubmit}>
        <label className="col" style={{ gap: 4 }}>
          <span className="auth-field-label">◆ 이메일</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="col" style={{ gap: 4 }}>
          <span className="auth-field-label">◆ 닉네임 (선택)</span>
          <input value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={12} />
        </label>
        <label className="col" style={{ gap: 4 }}>
          <span className="auth-field-label">◆ 비밀번호 (6자 이상)</span>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </label>
        <label className="col" style={{ gap: 4 }}>
          <span className="auth-field-label">◆ 비밀번호 확인</span>
          <PasswordInput
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            minLength={6}
            required
          />
        </label>
        {error && <div className="error">{error}</div>}
        <button type="submit" className="auth-submit" disabled={isPending}>
          {isPending ? <Spinner size={14} label="가입 중…" /> : "▶ 플레이어 등록"}
        </button>
      </form>
      <div className="auth-foot">
        이미 계정이 있나요? <Link href="/login">로그인</Link>
      </div>
      </div>
    </div>
  );
};
