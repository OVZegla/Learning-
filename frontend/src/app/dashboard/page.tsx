"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Protected } from "@/components/Protected";
import { Icon } from "@/components/Icons";
import { api } from "@/lib/api";

interface CourseCard {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  coverUrl?: string | null;
  author: { id: string; name: string };
}

const TINTS = ["var(--accent-soft)", "var(--mint-soft)", "var(--sky-soft)", "var(--plum-soft)", "var(--rose-soft)"];

export default function DashboardPage() {
  return (
    <Protected>
      <Dashboard />
    </Protected>
  );
}

function Dashboard() {
  const [courses, setCourses] = useState<CourseCard[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<CourseCard[]>("/courses")
      .then(setCourses)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p style={{ color: "var(--rose)" }}>{error}</p>;
  if (!courses) return <p style={{ color: "var(--ink-3)" }}>Chargement…</p>;

  return (
    <section>
      <div className="page-head">
        <div>
          <h1 className="page-title">Mes formations</h1>
          <p className="page-sub">Reprenez là où vous vous êtes arrêté.</p>
        </div>
      </div>

      {courses.length === 0 ? (
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
            <Icon.book />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px" }}>
            Aucune formation pour le moment
          </h2>
          <p style={{ color: "var(--ink-2)", margin: 0 }}>
            Contactez votre administrateur pour obtenir l'accès à vos formations.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 20,
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          }}
        >
          {courses.map((c, i) => (
            <Link key={c.id} href={`/courses/${c.id}`} className="course-card">
              <div
                className="course-thumb placeholder-img"
                data-label={c.coverUrl ? "cover.jpg" : `${c.category ?? "formation"}.jpg`}
                style={{ background: TINTS[i % TINTS.length] }}
              >
                {c.coverUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.coverUrl}
                    alt=""
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                )}
              </div>
              <div className="course-body">
                {c.category && <div className="course-cat mono">{c.category}</div>}
                <h3 className="course-title">{c.title}</h3>
                {c.description && (
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--ink-3)",
                      margin: "0 0 12px",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {c.description}
                  </p>
                )}
                <div className="course-meta">
                  <span><Icon.user width={13} height={13} /> {c.author.name}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
