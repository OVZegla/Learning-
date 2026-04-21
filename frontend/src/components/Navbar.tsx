"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { Icon } from "./Icons";
import { useAuth } from "@/lib/auth";

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || "";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  const isActive = (prefix: string) => pathname === prefix || pathname.startsWith(prefix + "/");
  const initials = user?.name?.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() ?? "";

  return (
    <header className={`topnav ${scrolled ? "is-scrolled" : ""}`}>
      <div className="topnav-inner">
        <Link href={user ? "/dashboard" : "/"} className="topnav-logo">
          <Logo />
        </Link>

        {user && (
          <nav className="topnav-links">
            <Link href="/dashboard" className={isActive("/dashboard") ? "is-active" : ""}>
              Mes formations
            </Link>
            {(user.role === "ADMIN" || user.role === "FORMATEUR") && (
              <Link href="/admin/courses" className={isActive("/admin/courses") ? "is-active" : ""}>
                Catalogue
              </Link>
            )}
            {user.role === "ADMIN" && (
              <>
                <Link href="/admin/users" className={isActive("/admin/users") ? "is-active" : ""}>
                  Utilisateurs
                </Link>
                <Link href="/admin/enrollments" className={isActive("/admin/enrollments") ? "is-active" : ""}>
                  Accès
                </Link>
              </>
            )}
          </nav>
        )}

        <div className="topnav-actions">
          <ThemeToggle />
          {user ? (
            <>
              <span className="topnav-user">
                <span className="avatar-sm" style={{ background: "var(--accent-soft)", color: "var(--accent-ink)" }}>
                  {initials}
                </span>
                {user.name}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm">
                Se connecter
              </Link>
              <Link href="/register" className="btn btn-accent btn-sm">
                Commencer
                <Icon.arrow width={16} height={16} />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
