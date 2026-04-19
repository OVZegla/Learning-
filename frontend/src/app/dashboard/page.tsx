"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Protected } from "@/components/Protected";
import { api } from "@/lib/api";

interface CourseCard {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  author: { id: string; name: string };
}

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

  if (error) return <p className="text-red-600">{error}</p>;
  if (!courses) return <p className="text-neutral-500">Chargement…</p>;

  if (courses.length === 0) {
    return (
      <section>
        <h1 className="mb-2 text-2xl font-semibold">Mes formations</h1>
        <p className="text-neutral-500">
          Aucune formation ne vous est encore attribuée. Contactez votre administrateur.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold">Mes formations</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => (
          <Link key={c.id} href={`/courses/${c.id}`} className="card block">
            {c.category && (
              <span className="text-xs uppercase tracking-wide text-brand-accent">{c.category}</span>
            )}
            <h2 className="mt-1 text-lg font-medium">{c.title}</h2>
            {c.description && (
              <p className="mt-2 line-clamp-3 text-sm text-neutral-500">{c.description}</p>
            )}
            <p className="mt-3 text-xs text-neutral-400">Par {c.author.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
