"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

type Kind = "signin" | "signup";

export function AuthShell({ kind, children }: { kind: Kind; children: React.ReactNode }) {
  return (
    <div className="auth">
      <aside className="auth-side">
        <Link href="/" className="auth-logo">
          <Logo />
        </Link>

        <div className="auth-side-inner">
          <div className="auth-quote-card">
            <span className="mono auth-quote-tag">#apprenant_de_la_semaine</span>
            <div className="auth-quote-avatar" />
            <div className="auth-quote-who">
              <div className="auth-quote-name">Léo B.</div>
              <div className="auth-quote-role">Technicien impression · Lyon</div>
            </div>
            <p className="auth-quote-text">
              « J'ai suivi les modules un par un, validé chaque quiz, et j'ai eu mon certificat
              à la fin. Concret, carré, pas de perte de temps. »
            </p>
            <div className="auth-quote-foot">
              <div className="auth-quote-stat">
                <span className="mono auth-quote-stat-num">12</span>
                <span className="auth-quote-stat-lbl">leçons<br />terminées</span>
              </div>
              <div className="auth-quote-stat">
                <span className="mono auth-quote-stat-num">3</span>
                <span className="auth-quote-stat-lbl">certificats<br />obtenus</span>
              </div>
              <div className="auth-quote-stat">
                <span className="mono auth-quote-stat-num">92%</span>
                <span className="auth-quote-stat-lbl">examen<br />final</span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-side-foot mono">© 2026 Learning+</div>
      </aside>

      <main className="auth-main">
        <div className="auth-main-top">
          <ThemeToggle />
          {kind === "signin" ? (
            <span className="mono auth-switch">
              Nouveau ici ? <Link href="/register">Créer un compte</Link>
            </span>
          ) : (
            <span className="mono auth-switch">
              Déjà un compte ? <Link href="/login">Se connecter</Link>
            </span>
          )}
        </div>
        <div className="auth-form-wrap">{children}</div>
      </main>
    </div>
  );
}
