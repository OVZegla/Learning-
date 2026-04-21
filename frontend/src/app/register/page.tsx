"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { Icon } from "@/components/Icons";
import { useAuth } from "@/lib/auth";

function scoreStrength(pw: string) {
  if (!pw) return { score: 0, label: "Entrez votre mot de passe" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[0-9]/.test(pw) && /[a-zA-Z]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["Trop court", "Faible", "Correct", "Fort", "Excellent"];
  return { score, label: labels[score] };
}

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const strength = scoreStrength(password);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await register(name, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message ?? "Erreur d'inscription");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell kind="signup">
      <form className="auth-form" onSubmit={onSubmit}>
        <h1 className="auth-title">Créez votre compte</h1>
        <p className="auth-sub">
          Une fois inscrit, vous recevrez l'accès aux formations attribuées par votre administrateur.
        </p>

        <div className="field">
          <label>Nom complet</label>
          <input
            placeholder="Marie Chassagne"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label>Adresse email professionnelle</label>
          <input
            type="email"
            placeholder="marie@entreprise.fr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label>Mot de passe</label>
          <input
            type="password"
            placeholder="8 caractères minimum"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginTop: 4,
              fontSize: 11,
            }}
          >
            <div style={{ display: "flex", gap: 3, flex: 1 }}>
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  style={{
                    height: 3,
                    flex: 1,
                    borderRadius: 999,
                    background:
                      i < strength.score
                        ? ["var(--rose)", "oklch(0.78 0.14 60)", "oklch(0.78 0.14 110)", "var(--mint)"][strength.score - 1]
                        : "var(--line)",
                    transition: "background 0.2s ease",
                  }}
                />
              ))}
            </div>
            <span className="mono" style={{ color: "var(--ink-3)" }}>{strength.label}</span>
          </div>
        </div>

        {error && (
          <p style={{ color: "var(--rose)", fontSize: 13, marginBottom: 12 }}>{error}</p>
        )}

        <button className="btn btn-accent btn-block btn-lg" disabled={busy} type="submit">
          {busy ? "Création…" : "Créer mon compte"}
          {!busy && <Icon.arrow />}
        </button>

        <p className="auth-legal mono">
          En créant un compte, vous acceptez nos CGU et notre politique de confidentialité.
        </p>
      </form>
    </AuthShell>
  );
}
