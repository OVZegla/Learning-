"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { Icon } from "@/components/Icons";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message ?? "Erreur de connexion");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell kind="signin">
      <form className="auth-form" onSubmit={onSubmit}>
        <h1 className="auth-title">Content de vous revoir 👋</h1>
        <p className="auth-sub">Connectez-vous pour reprendre là où vous vous êtes arrêté.</p>

        <div className="field">
          <label>Adresse email</label>
          <input
            type="email"
            placeholder="vous@entreprise.fr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <div className="field-label-row">
            <label>Mot de passe</label>
          </div>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <p style={{ color: "var(--rose)", fontSize: 13, marginBottom: 12 }}>{error}</p>
        )}

        <button className="btn btn-accent btn-block btn-lg" disabled={busy} type="submit">
          {busy ? "Connexion…" : "Se connecter"}
          {!busy && <Icon.arrow />}
        </button>

        <p className="auth-legal mono">
          En continuant, vous acceptez nos CGU et notre politique de confidentialité.
        </p>
      </form>
    </AuthShell>
  );
}
