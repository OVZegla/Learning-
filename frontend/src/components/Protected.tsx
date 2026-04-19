"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, Role } from "@/lib/auth";

export function Protected({
  roles,
  children,
}: {
  roles?: Role[];
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (roles && !roles.includes(user.role)) router.replace("/dashboard");
  }, [user, loading, router, roles]);

  if (loading || !user) return <p className="text-neutral-500">Chargement…</p>;
  if (roles && !roles.includes(user.role)) return null;
  return <>{children}</>;
}
