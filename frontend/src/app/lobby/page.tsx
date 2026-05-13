"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/entities/user/model/authStore";
import { Lobby } from "@/widgets/lobby/ui/Lobby";
import { FullPageSpinner } from "@/shared/ui/Spinner";

export default function LobbyPage() {
  const router = useRouter();
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (hydrated && !token) router.replace("/login");
  }, [hydrated, token, router]);

  if (!hydrated || !token) return <FullPageSpinner label="불러오는 중…" />;
  return <Lobby />;
}
