"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Protected } from "@/components/Protected";
import { Icon } from "@/components/Icons";
import { api } from "@/lib/api";

interface CourseWithCounts {
  id: string;
  title: string;
  category: string | null;
  canAnswer: boolean;
  openCount: number;
  resolvedCount: number;
}

export default function QuestionsHubPage() {
  return (
    <Protected>
      <Hub />
    </Protected>
  );
}

function Hub() {
  const [courses, setCourses] = useState<CourseWithCounts[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<CourseWithCounts[]>("/questions/courses")
      .then(setCourses)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p style={{ color: "var(--rose)" }}>{error}</p>;
  if (!courses) return <p style={{ color: "var(--ink-3)" }}>Chargement…</p>;

  return (
    <section>
      <div className="page-head">
        <div>
          <h1 className="page-title">Questions / Réponses</h1>
          <p className="page-sub">
            Consultez les questions posées sur vos formations, et leurs réponses officielles.
          </p>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 48, color: "var(--ink-3)" }}>
          Aucune formation accessible pour le moment.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          }}
        >
          {courses.map((c) => (
            <Link key={c.id} href={`/questions/${c.id}`} className="card" style={{ display: "block" }}>
              {c.category && <div className="course-cat mono">{c.category}</div>}
              <h3 style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em", margin: "4px 0 14px" }}>
                {c.title}
              </h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {c.openCount > 0 ? (
                  <span className="pill pill-accent">
                    {c.openCount} question{c.openCount > 1 ? "s" : ""} ouverte{c.openCount > 1 ? "s" : ""}
                  </span>
                ) : (
                  <span className="pill">Aucune question ouverte</span>
                )}
                {c.resolvedCount > 0 && (
                  <span className="pill pill-mint">
                    {c.resolvedCount} résolue{c.resolvedCount > 1 ? "s" : ""}
                  </span>
                )}
                {c.canAnswer && <span className="pill pill-plum">Vous pouvez répondre</span>}
              </div>
              <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6, color: "var(--ink-2)", fontSize: 13 }}>
                Voir les Q&amp;R <Icon.arrow width={13} height={13} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
