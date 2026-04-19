"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { useAuth } from "@/lib/auth";

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <header className="flex items-center justify-between border-b border-neutral-200 bg-white/80 px-6 py-3 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
      <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
        <Logo />
      </Link>
      <nav className="flex items-center gap-3 text-sm">
        {user ? (
          <>
            <Link href="/dashboard" className="hover:underline">
              Mes formations
            </Link>
            {(user.role === "ADMIN" || user.role === "FORMATEUR") && (
              <Link href="/admin/courses" className="hover:underline">
                Formations
              </Link>
            )}
            {user.role === "ADMIN" && (
              <>
                <Link href="/admin/users" className="hover:underline">
                  Utilisateurs
                </Link>
                <Link href="/admin/enrollments" className="hover:underline">
                  Accès
                </Link>
              </>
            )}
            <span className="ml-2 text-neutral-500">{user.name}</span>
            <button className="btn-secondary" onClick={handleLogout}>
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="btn-secondary">
              Connexion
            </Link>
            <Link href="/register" className="btn">
              Inscription
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
