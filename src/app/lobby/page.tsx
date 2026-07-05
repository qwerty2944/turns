"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/entities/user/model/authStore";
import { authApi } from "@/entities/user/api/auth";
import { Lobby } from "@/widgets/lobby/ui/Lobby";
import { FullPageSpinner } from "@/shared/ui/Spinner";

export default function LobbyPage() {
  const router = useRouter();
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (hydrated && !token) router.replace("/login");
  }, [hydrated, token, router]);

  // Validate the stored token against the backend on mount — if another
  // browser logged in as this user and bumped token_version, /auth/me
  // returns 401 and the axios interceptor will clear+redirect.
  useEffect(() => {
    if (!hydrated || !token) return;
    authApi.me().catch(() => {
      /* interceptor handles 401 globally; swallow other errors here */
    });
  }, [hydrated, token]);

  if (!hydrated || !token) return <FullPageSpinner label="불러오는 중…" />;
  return <Lobby />;
}
