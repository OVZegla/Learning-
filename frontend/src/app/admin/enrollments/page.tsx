"use client";

import { FormEvent, useEffect, useState } from "react";
import { Protected } from "@/components/Protected";
import { Icon } from "@/components/Icons";
import { api } from "@/lib/api";

interface User { id: string; email: string; name: string }
interface Course { id: string; title: string }
interface Enrollment {
  id: string;
  expiresAt: string | null;
  revokedAt: string | null;
  grantedAt: string;
  user: User | null;
  group: { id: string; name: string } | null;
  course: Course;
}

export default function EnrollmentsPage() {
  return (
    <Protected roles={["ADMIN"]}>
      <Enrollments />
    </Protected>
  );
}

function Enrollments() {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [userId, setUserId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const [u, c, e] = await Promise.all([
      api<User[]>("/users"),
      api<Course[]>("/courses"),
      api<Enrollment[]>("/enrollments"),
    ]);
    setUsers(u);
    setCourses(c);
    setEnrollments(e);
    if (!userId && u[0]) setUserId(u[0].id);
    if (!courseId && c[0]) setCourseId(c[0].id);
  }

  useEffect(() => {
    refresh().catch((e) => setError(e.message));
  }, []);

  async function grant(ev: FormEvent) {
    ev.preventDefault();
    setError(null);
    try {
      await api("/enrollments", {
        method: "POST",
        body: JSON.stringify({
          userId,
          courseId,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        }),
      });
      setExpiresAt("");
      await refresh();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function revoke(id: string) {
    if (!confirm("Révoquer cet accès ?")) return;
    await api(`/enrollments/${id}`, { method: "DELETE" });
    await refresh();
  }

  return (
    <section>
      <div className="page-head">
        <div>
          <h1 className="page-title">Accès</h1>
          <p className="page-sub">
            Attribuez ou révoquez l'accès à une formation pour un utilisateur.
          </p>
        </div>
      </div>

      <form className="card" style={{ marginBottom: 28 }} onSubmit={grant}>
        <h2 className="section-title-sm">Attribuer un accès</h2>
        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            alignItems: "end",
          }}
        >
          <div className="field">
            <label>Utilisateur</label>
            <select value={userId} onChange={(e) => setUserId(e.target.value)}>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Formation</label>
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Expire le (optionnel)</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>
          <button className="btn btn-accent" type="submit">
            <Icon.plus width={16} height={16} />
            Accorder l'accès
          </button>
        </div>
        {error && <p style={{ color: "var(--rose)", fontSize: 13, marginTop: 12 }}>{error}</p>}
      </form>

      <h2 className="section-title-sm">Accès actifs</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Bénéficiaire</th>
            <th>Formation</th>
            <th>Expire</th>
            <th>Statut</th>
            <th className="col-right"></th>
          </tr>
        </thead>
        <tbody>
          {enrollments.map((e) => (
            <tr key={e.id}>
              <td>
                {e.user ? (
                  <>
                    <div style={{ fontWeight: 500 }}>{e.user.name}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{e.user.email}</div>
                  </>
                ) : (
                  <span className="pill pill-plum">Groupe · {e.group?.name}</span>
                )}
              </td>
              <td style={{ color: "var(--ink-2)" }}>{e.course.title}</td>
              <td style={{ color: "var(--ink-3)" }} className="mono">
                {e.expiresAt ? new Date(e.expiresAt).toLocaleDateString("fr-FR") : "—"}
              </td>
              <td>
                {e.revokedAt ? (
                  <span className="pill" style={{ color: "var(--rose)" }}>Révoqué</span>
                ) : (
                  <span className="pill pill-mint">Actif</span>
                )}
              </td>
              <td className="col-right">
                {!e.revokedAt && (
                  <button className="btn btn-danger btn-sm" onClick={() => revoke(e.id)}>
                    Révoquer
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
