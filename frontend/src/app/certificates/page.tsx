"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Protected } from "@/components/Protected";
import { Icon } from "@/components/Icons";
import { api } from "@/lib/api";

interface Certificate {
  id: string;
  issuedAt: string;
  course: { id: string; title: string; category: string | null };
}

export default function CertificatesPage() {
  return (
    <Protected>
      <Certificates />
    </Protected>
  );
}

function Certificates() {
  const [items, setItems] = useState<Certificate[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Certificate[]>("/certificates")
      .then(setItems)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p style={{ color: "var(--rose)" }}>{error}</p>;
  if (!items) return <p style={{ color: "var(--ink-3)" }}>Chargement…</p>;

  return (
    <section>
      <div className="page-head">
        <div>
          <h1 className="page-title">Mes certificats</h1>
          <p className="page-sub">Toutes les formations que vous avez validées jusqu'à l'examen final.</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 48 }}>
          <div
            style={{
              width: 56,
              height: 56,
              margin: "0 auto 16px",
              borderRadius: 16,
              background: "var(--bg-inset)",
              color: "var(--ink-3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon.award />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px" }}>
            Aucun certificat pour le moment
          </h2>
          <p style={{ color: "var(--ink-2)", margin: 0 }}>
            Terminez une formation et réussissez l'examen final pour obtenir votre premier certificat.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 20,
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          }}
        >
          {items.map((cert) => (
            <div key={cert.id} className="card" style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: "var(--mint)",
                    color: "var(--mint-ink)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon.award />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    {cert.course.category ?? "Certificat"}
                  </div>
                  <h3
                    style={{
                      fontSize: 17,
                      fontWeight: 600,
                      letterSpacing: "-0.02em",
                      margin: "4px 0 0",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {cert.course.title}
                  </h3>
                </div>
              </div>

              <div
                style={{
                  padding: 12,
                  borderRadius: 10,
                  background: "var(--mint-soft)",
                  color: "var(--mint-ink)",
                  fontSize: 13,
                  marginBottom: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Icon.check width={14} height={14} />
                Délivré le <strong>{new Date(cert.issuedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</strong>
              </div>

              <Link className="btn btn-outline btn-sm" href={`/courses/${cert.course.id}`}>
                Revoir la formation
                <Icon.arrow width={14} height={14} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
