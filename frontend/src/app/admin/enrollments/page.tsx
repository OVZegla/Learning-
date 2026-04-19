"use client";

import { FormEvent, useEffect, useState } from "react";
import { Protected } from "@/components/Protected";
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
    await api(`/enrollments/${id}`, { method: "DELETE" });
    await refresh();
  }

  return (
    <section className="space-y-8">
      <div>
        <h1 className="mb-4 text-2xl font-semibold">Attribuer un accès</h1>
        <form className="card flex flex-wrap items-end gap-4" onSubmit={grant}>
          <label className="flex-1 space-y-1">
            <span className="text-sm text-neutral-500">Utilisateur</span>
            <select className="input" value={userId} onChange={(e) => setUserId(e.target.value)}>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </label>
          <label className="flex-1 space-y-1">
            <span className="text-sm text-neutral-500">Formation</span>
            <select className="input" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-sm text-neutral-500">Expire le (optionnel)</span>
            <input
              type="date"
              className="input"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </label>
          <button className="btn">Accorder l'accès</button>
          {error && <p className="w-full text-sm text-red-600">{error}</p>}
        </form>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Accès actifs</h2>
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="py-2">Bénéficiaire</th>
              <th>Formation</th>
              <th>Expire</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((e) => (
              <tr key={e.id} className="border-t border-neutral-200 dark:border-neutral-800">
                <td className="py-2">
                  {e.user ? `${e.user.name} (${e.user.email})` : `Groupe: ${e.group?.name}`}
                </td>
                <td>{e.course.title}</td>
                <td>{e.expiresAt ? new Date(e.expiresAt).toLocaleDateString() : "—"}</td>
                <td>{e.revokedAt ? "Révoqué" : "Actif"}</td>
                <td className="text-right">
                  {!e.revokedAt && (
                    <button className="btn-secondary" onClick={() => revoke(e.id)}>
                      Révoquer
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
