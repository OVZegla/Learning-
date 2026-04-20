"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Protected } from "@/components/Protected";
import { api } from "@/lib/api";

interface Course {
  id: string;
  title: string;
  description: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  author: { id: string; name: string };
  updatedAt: string;
}

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

  async function refresh() {
    try {
      setCourses(await api<Course[]>("/courses"));
    } catch (e: any) {
      setError(e.message);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

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
    <section className="space-y-8">
      <div>
        <h1 className="mb-4 text-2xl font-semibold">Créer une formation</h1>
        <form className="card space-y-3" onSubmit={create}>
          <input
            className="input"
            placeholder="Titre"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className="input"
            placeholder="Description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn">Créer</button>
        </form>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Formations existantes</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {courses.map((c) => (
            <div key={c.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium">
                    <Link href={`/courses/${c.id}`} className="hover:underline">
                      {c.title}
                    </Link>
                  </h3>
                  <p className="text-xs text-neutral-500">Par {c.author.name}</p>
                </div>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs dark:bg-neutral-800">
                  {c.status}
                </span>
              </div>
              {c.description && (
                <p className="mt-2 line-clamp-2 text-sm text-neutral-500">{c.description}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <Link className="btn-secondary" href={`/admin/courses/${c.id}/edit`}>
                  Éditer le contenu
                </Link>
                {c.status !== "PUBLISHED" && (
                  <button className="btn-secondary" onClick={() => setStatus(c.id, "PUBLISHED")}>
                    Publier
                  </button>
                )}
                {c.status !== "DRAFT" && (
                  <button className="btn-secondary" onClick={() => setStatus(c.id, "DRAFT")}>
                    Brouillon
                  </button>
                )}
                <button className="btn-secondary" onClick={() => remove(c.id)}>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
