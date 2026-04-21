"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Protected } from "@/components/Protected";
import { Icon } from "@/components/Icons";
import { api } from "@/lib/api";

interface Course {
  id: string;
  title: string;
  description: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  author: { id: string; name: string };
  updatedAt: string;
}

const STATUS_PILL: Record<Course["status"], string> = {
  DRAFT: "pill",
  PUBLISHED: "pill pill-mint",
  ARCHIVED: "pill pill-plum",
};

export default function AdminCoursesPage() {
  return (
    <Protected roles={["ADMIN", "FORMATEUR"]}>
      <Courses />
    </Protected>
  );
}

function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function refresh() {
    try {
      setCourses(await api<Course[]>("/courses"));
    } catch (e: any) {
      setError(e.message);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function create(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api("/courses", {
        method: "POST",
        body: JSON.stringify({ title, description }),
      });
      setTitle("");
      setDescription("");
      setShowForm(false);
      await refresh();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function setStatus(id: string, status: Course["status"]) {
    await api(`/courses/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    await refresh();
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cette formation ?")) return;
    await api(`/courses/${id}`, { method: "DELETE" });
    await refresh();
  }

  return (
    <section>
      <div className="page-head">
        <div>
          <h1 className="page-title">Catalogue</h1>
          <p className="page-sub">Créez, publiez et gérez les formations de votre organisation.</p>
        </div>
        <button className="btn btn-accent" onClick={() => setShowForm((v) => !v)}>
          <Icon.plus width={16} height={16} />
          Nouvelle formation
        </button>
      </div>

      {showForm && (
        <form className="card" style={{ marginBottom: 24, maxWidth: 640 }} onSubmit={create}>
          <h2 className="section-title-sm">Créer une formation</h2>
          <div className="field" style={{ marginBottom: 12 }}>
            <label>Titre</label>
            <input
              placeholder="Ex. Les bases de l'impression murale"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="field" style={{ marginBottom: 12 }}>
            <label>Description</label>
            <textarea
              placeholder="De quoi parle cette formation ?"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          {error && <p style={{ color: "var(--rose)", fontSize: 13 }}>{error}</p>}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button className="btn btn-accent" type="submit">Créer</button>
            <button className="btn btn-ghost" type="button" onClick={() => setShowForm(false)}>
              Annuler
            </button>
          </div>
        </form>
      )}

      <h2 className="section-title-sm">Formations existantes</h2>
      {courses.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 48, color: "var(--ink-3)" }}>
          Aucune formation créée pour le moment.
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
            <div key={c.id} className="card">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>
                    <Link href={`/courses/${c.id}`} style={{ color: "var(--ink)" }}>
                      {c.title}
                    </Link>
                  </h3>
                  <p style={{ fontSize: 12, color: "var(--ink-3)", margin: "4px 0 0" }}>
                    Par {c.author.name}
                  </p>
                </div>
                <span className={STATUS_PILL[c.status]}>{c.status}</span>
              </div>

              {c.description && (
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--ink-2)",
                    margin: "12px 0 0",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {c.description}
                </p>
              )}

              <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Link className="btn btn-outline btn-sm" href={`/admin/courses/${c.id}/edit`}>
                  <Icon.edit width={14} height={14} />
                  Éditer le contenu
                </Link>
                {c.status !== "PUBLISHED" && (
                  <button className="btn btn-outline btn-sm" onClick={() => setStatus(c.id, "PUBLISHED")}>
                    Publier
                  </button>
                )}
                {c.status !== "DRAFT" && (
                  <button className="btn btn-outline btn-sm" onClick={() => setStatus(c.id, "DRAFT")}>
                    Repasser en brouillon
                  </button>
                )}
                <button className="btn btn-danger btn-sm" onClick={() => remove(c.id)}>
                  <Icon.trash width={14} height={14} />
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
