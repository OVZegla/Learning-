"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Logo } from "@/components/Logo";
import { Icon } from "@/components/Icons";
import { useAuth } from "@/lib/auth";

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <>
        <Navbar />
        <p style={{ padding: 40, color: "var(--ink-3)" }}>Chargement…</p>
      </>
    );
  }

  return (
    <div className="landing">
      <Navbar />

      <Hero authed={!!user} />
      <Features />
      <HowItWorks />
      <CTAStrip authed={!!user} />
      <Footer />
    </div>
  );
}

function Hero({ authed }: { authed: boolean }) {
  const [progress, setProgress] = useState(62);
  useEffect(() => {
    const t = setInterval(() => setProgress((p) => (p >= 72 ? 62 : p + 1)), 200);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="hero">
      <div className="hero-bg" aria-hidden>
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
      </div>
      <div className="hero-inner">
        <div className="hero-badge">
          <span className="dot" style={{ background: "var(--mint)" }} />
          <span className="mono">Formations terrain · Certificats inclus</span>
        </div>
        <h1 className="hero-title">
          Apprenez des choses<br />
          <span className="hero-title-accent">concrètes.</span><br />
          À votre rythme.
        </h1>
        <p className="hero-sub">
          Learning+ est la plateforme interne pour former vos équipes sur l'impression, la
          maintenance, les logiciels. Des cours courts, des quiz pour valider, des certificats
          quand tout est réussi.
        </p>
        <div className="hero-actions">
          <Link href={authed ? "/dashboard" : "/register"} className="btn btn-accent btn-lg">
            {authed ? "Voir mes formations" : "Commencer maintenant"}
            <Icon.arrow />
          </Link>
          {!authed && (
            <Link href="/login" className="btn btn-outline btn-lg">
              <Icon.user width={18} height={18} />
              J'ai déjà un compte
            </Link>
          )}
        </div>
        <div className="hero-proof">
          <div className="hero-avatars">
            {["#F4B942", "#85C7A6", "#B49FE5", "#6FA8DC", "#E88D8D"].map((c, i) => (
              <span key={i} className="avatar-sm" style={{ background: c }}>
                {["M", "T", "L", "R", "A"][i]}
              </span>
            ))}
          </div>
          <div className="hero-proof-text">
            <strong>Progression suivie</strong> · Déverrouillage séquentiel · Examen final
          </div>
        </div>
      </div>

      <HeroCard progress={progress} />
    </section>
  );
}

function HeroCard({ progress }: { progress: number }) {
  return (
    <div className="hero-card-wrap">
      <div className="hero-card hero-card-main">
        <div className="hero-card-thumb placeholder-img" data-label="impression_murale.mp4" />
        <div className="hero-card-body">
          <span className="pill pill-accent">Module 3 · leçon 2</span>
          <div className="hero-card-title">Les bases de l'impression murale</div>
          <div className="hero-card-meta">
            <Icon.clock width={14} height={14} /> 4 min restantes
          </div>
          <div className="hero-progress">
            <div className="hero-progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <div className="hero-card-foot">
            <span className="mono">{progress}% terminé</span>
            <span className="btn btn-primary btn-sm">
              <Icon.play width={12} height={12} />
              Reprendre
            </span>
          </div>
        </div>
      </div>

      <div className="float-chip float-cert">
        <div className="float-cert-icon"><Icon.award width={18} height={18} /></div>
        <div>
          <div className="float-chip-title">Certificat débloqué</div>
          <div className="float-chip-sub mono">Examen final · 92/100</div>
        </div>
      </div>

      <div className="float-chip float-quiz">
        <div className="quiz-dot" />
        <div>
          <div className="float-chip-title">Quiz validé</div>
          <div className="float-chip-sub mono">8/10 · module suivant débloqué</div>
        </div>
      </div>
    </div>
  );
}

function Features() {
  const features = [
    {
      tag: "01",
      title: "Un parcours structuré, pas une playlist",
      body: "Chaque formation est découpée en chapitres et en leçons. Les apprenants voient ce qui reste, ce qui est fait, ce qui est verrouillé.",
      accent: "var(--accent)",
    },
    {
      tag: "02",
      title: "Des quiz qui font avancer",
      body: "QCM à choix simple ou multiple. Score calculé côté serveur. Tant que le quiz du chapitre n'est pas validé, le suivant reste fermé.",
      accent: "var(--mint)",
    },
    {
      tag: "03",
      title: "Un examen final qui certifie",
      body: "Quand un apprenant termine toutes les leçons et réussit l'examen, son certificat est délivré automatiquement et reste disponible dans son espace.",
      accent: "var(--plum)",
    },
  ];

  return (
    <section className="features">
      <div className="section-head">
        <span className="pill">Pourquoi Learning+</span>
        <h2 className="section-title">Apprendre, vraiment. Pas juste regarder des vidéos.</h2>
      </div>
      <div className="features-grid">
        {features.map((f) => (
          <div key={f.tag} className="feature-card">
            <div className="feature-tag mono" style={{ color: f.accent }}>{f.tag}</div>
            <div className="feature-art">
              <div className="hero-progress" style={{ marginTop: 60 }}>
                <div className="hero-progress-bar" style={{ width: "60%", background: f.accent }} />
              </div>
            </div>
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-body">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "1", t: "L'admin crée la formation", s: "Chapitres, leçons vidéo/texte/PDF, quiz avec bonne réponse. L'auteur compose tout dans l'éditeur." },
    { n: "2", t: "L'admin donne l'accès", s: "Par personne ou par groupe, avec ou sans date d'expiration. L'apprenant voit apparaître sa formation." },
    { n: "3", t: "L'apprenant progresse", s: "Leçon par leçon. Chaque chapitre se valide avec un quiz. Le précédent doit être réussi pour avancer." },
    { n: "4", t: "Le certificat est délivré", s: "Après l'examen final validé, le certificat PDF apparaît dans l'espace de l'apprenant." },
  ];

  return (
    <section className="how">
      <div className="section-head">
        <span className="pill">Comment ça marche</span>
        <h2 className="section-title">Quatre étapes. Et c'est tout.</h2>
      </div>
      <div className="how-grid">
        {steps.map((s) => (
          <div key={s.n} className="how-step">
            <div className="how-n mono">{s.n}</div>
            <h3 className="how-t">{s.t}</h3>
            <p className="how-s">{s.s}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTAStrip({ authed }: { authed: boolean }) {
  return (
    <section className="cta">
      <div className="cta-inner">
        <div>
          <h2 className="cta-title">Prêt à vous former ?</h2>
          <p className="cta-sub">Accès attribué par votre administrateur. Progression et certificats inclus.</p>
        </div>
        <div className="cta-actions">
          {authed ? (
            <Link href="/dashboard" className="btn btn-accent btn-lg">
              Mes formations <Icon.arrow />
            </Link>
          ) : (
            <>
              <Link href="/register" className="btn btn-accent btn-lg">
                Créer mon compte <Icon.arrow />
              </Link>
              <Link href="/login" className="btn btn-ghost btn-lg">
                J'ai déjà un compte
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="foot">
      <div className="foot-inner">
        <Logo size={22} />
        <span className="mono">© 2026 Learning+ · Apprendre des choses concrètes, à votre rythme.</span>
      </div>
    </footer>
  );
}
