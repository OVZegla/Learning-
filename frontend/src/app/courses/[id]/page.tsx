"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Protected } from "@/components/Protected";
import { api } from "@/lib/api";

type LessonType = "VIDEO" | "TEXT" | "PDF" | "IMAGE" | "QUIZ";

interface Lesson {
  id: string;
  title: string;
  position: number;
  type: LessonType;
  content: Record<string, unknown>;
}

interface Module {
  id: string;
  title: string;
  position: number;
  lessons: Lesson[];
}

interface CourseDetail {
  id: string;
  title: string;
  description?: string | null;
  author: { id: string; name: string };
  modules: Module[];
}

export default function CourseDetailPage() {
  return (
    <Protected>
      <CourseDetail />
    </Protected>
  );
}

function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<Lesson | null>(null);

  useEffect(() => {
    api<CourseDetail>(`/courses/${id}`)
      .then((c) => {
        setCourse(c);
        setCurrent(c.modules[0]?.lessons[0] ?? null);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!course) return <p className="text-neutral-500">Chargement…</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-4">
        <h1 className="text-xl font-semibold">{course.title}</h1>
        <nav className="space-y-3">
          {course.modules.map((m) => (
            <div key={m.id}>
              <div className="text-sm font-medium text-neutral-500">{m.title}</div>
              <ul className="mt-1 space-y-1">
                {m.lessons.map((l) => (
                  <li key={l.id}>
                    <button
                      className={`w-full rounded px-2 py-1 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                        current?.id === l.id ? "bg-neutral-100 font-medium dark:bg-neutral-800" : ""
                      }`}
                      onClick={() => setCurrent(l)}
                    >
                      {l.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
      <section className="card min-h-[400px]">
        {current ? <LessonView lesson={current} /> : <p>Sélectionnez une leçon.</p>}
      </section>
    </div>
  );
}

function LessonView({ lesson }: { lesson: Lesson }) {
  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">{lesson.title}</h2>
      {lesson.type === "TEXT" && (
        <div className="prose dark:prose-invert whitespace-pre-wrap">
          {String((lesson.content as any).body ?? "")}
        </div>
      )}
      {lesson.type === "VIDEO" && (
        <video
          src={String((lesson.content as any).url ?? "")}
          controls
          controlsList="nodownload"
          className="w-full rounded"
        />
      )}
      {lesson.type === "PDF" && (
        <iframe src={String((lesson.content as any).url ?? "")} className="h-[600px] w-full rounded" />
      )}
      {lesson.type === "IMAGE" && (
        <img src={String((lesson.content as any).url ?? "")} alt={lesson.title} className="rounded" />
      )}
      {lesson.type === "QUIZ" && (
        <p className="text-neutral-500">Quiz — interface à venir.</p>
      )}
    </div>
  );
}
