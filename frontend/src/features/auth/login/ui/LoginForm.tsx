"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "../api";
import { extractApiError } from "@/shared/api/axios";
import { Spinner } from "@/shared/ui/Spinner";

export const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { mutate, isPending } = useLoginMutation();
  const [error, setError] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    mutate(
      { email, password },
      {
        onSuccess: () => router.replace("/lobby"),
        onError: (err) => setError(extractApiError(err)),
      },
    );
  };

  return (
    <div className="panel col">
      <h1 className="title" style={{ margin: 0 }}>Turns</h1>
      <p className="muted" style={{ marginTop: -8 }}>보드게임 매칭</p>
      <form className="col" onSubmit={onSubmit}>
        <label className="col" style={{ gap: 4 }}>
          <span className="muted">이메일</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
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
