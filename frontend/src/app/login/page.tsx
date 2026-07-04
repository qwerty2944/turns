"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/features/auth/login/ui/LoginForm";
import { useAuthStore } from "@/entities/user/model/authStore";
import { FullPageSpinner } from "@/shared/ui/Spinner";

export default function LoginPage() {
  const router = useRouter();
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (hydrated && token) router.replace("/lobby");
  }, [hydrated, token, router]);

  if (!hydrated) return <FullPageSpinner label="불러오는 중…" />;
  if (token) return null;

  return (
    <div className="auth-shell">
      <div className="landing-stars" aria-hidden="true" />
      <LoginForm />
    </div>
  );
}
