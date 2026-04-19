"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) return <p className="text-neutral-500">Chargement…</p>;

  return (
    <section className="mx-auto max-w-2xl text-center">
      <h1 className="text-4xl font-semibold tracking-tight">Bienvenue sur Learning+</h1>
      <p className="mt-4 text-neutral-500">
        Une plateforme pour créer des formations et donner un accès contrôlé aux apprenants.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        {user ? (
          <Link href="/dashboard" className="btn">
            Aller à mes formations
          </Link>
        ) : (
          <>
            <Link href="/login" className="btn">
              Se connecter
            </Link>
            <Link href="/register" className="btn-secondary">
              Créer un compte
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
