"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Protected } from "@/components/Protected";
import { api } from "@/lib/api";

type LessonType = "VIDEO" | "TEXT" | "PDF" | "IMAGE" | "QUIZ";

interface QuizChoice {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  prompt: string;
  type: "SINGLE" | "MULTIPLE";
  position: number;
  choices: QuizChoice[];
}

interface Quiz {
  id: string;
  passingScore: number;
  isFinal: boolean;
  questions: QuizQuestion[];
}

interface Lesson {
  id: string;
  title: string;
  position: number;
  type: LessonType;
  content: Record<string, any>;
  completed: boolean;
  locked: boolean;
  unlocked: boolean;
  quiz: Quiz | null;
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
  requireSequentialProgress: boolean;
  canEdit: boolean;
  certificate: { id: string; issuedAt: string } | null;
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
  const [currentId, setCurrentId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const c = await api<CourseDetail>(`/courses/${id}`);
      setCourse(c);
      setCurrentId((prev) => {
        if (prev && c.modules.some((m) => m.lessons.some((l) => l.id === prev))) {
          return prev;
        }
        const firstUnlocked =
          c.modules.flatMap((m) => m.lessons).find((l) => l.unlocked) ??
          c.modules[0]?.lessons[0];
        return firstUnlocked?.id ?? null;
      });
    } catch (e: any) {
      setError(e.message);
    }
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const current = useMemo(() => {
    if (!course || !currentId) return null;
    for (const m of course.modules) {
      for (const l of m.lessons) if (l.id === currentId) return l;
    }
    return null;
  }, [course, currentId]);

  const stats = useMemo(() => {
    if (!course) return { total: 0, done: 0 };
    const all = course.modules.flatMap((m) => m.lessons);
    return { total: all.length, done: all.filter((l) => l.completed).length };
  }, [course]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!course) return <p className="text-neutral-500">Chargement…</p>;

  const pct = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{course.title}</h1>
          {course.description && (
            <p className="text-sm text-neutral-500">{course.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {course.canEdit && (
            <Link className="btn-secondary" href={`/admin/courses/${course.id}/edit`}>
              Éditer la formation
            </Link>
          )}
        </div>
      </div>

      {course.certificate && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
          🏆 Certificat obtenu le{" "}
          {new Date(course.certificate.issuedAt).toLocaleDateString("fr-FR")}.
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between text-sm">
          <span>
            Progression : {stats.done}/{stats.total} leçons
          </span>
          <span className="font-medium">{pct}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded bg-neutral-200 dark:bg-neutral-800">
          <div className="h-full bg-brand-accent" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside>
          <nav className="space-y-4">
            {course.modules.map((m) => (
              <div key={m.id}>
                <div className="text-sm font-medium text-neutral-500">{m.title}</div>
                <ul className="mt-1 space-y-1">
                  {m.lessons.map((l) => {
                    const active = currentId === l.id;
                    const lockedDisplay = l.locked && !course.canEdit;
                    return (
                      <li key={l.id}>
                        <button
                          className={`flex w-full items-center justify-between gap-2 rounded px-2 py-1 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                            active ? "bg-neutral-100 font-medium dark:bg-neutral-800" : ""
                          } ${lockedDisplay ? "opacity-60" : ""}`}
                          onClick={() => setCurrentId(l.id)}
                          disabled={lockedDisplay}
                          title={lockedDisplay ? "Terminez la leçon précédente" : ""}
                        >
                          <span className="flex items-center gap-2">
                            <span>
                              {l.completed ? "✓" : lockedDisplay ? "🔒" : "○"}
                            </span>
                            <span>{l.title}</span>
                          </span>
                          {l.quiz?.isFinal && (
                            <span className="rounded bg-amber-100 px-1 text-[10px] text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
                              EXAM
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <section className="card min-h-[400px]">
          {current ? (
            <LessonView
              courseId={course.id}
              lesson={current}
              canEdit={course.canEdit}
              onProgress={refresh}
            />
          ) : (
            <p>Sélectionnez une leçon.</p>
          )}
        </section>
      </div>
    </div>
  );
}

function LessonView({
  courseId: _courseId,
  lesson,
  canEdit,
  onProgress,
}: {
  courseId: string;
  lesson: Lesson;
  canEdit: boolean;
  onProgress: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (lesson.locked && !canEdit) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center text-neutral-500">
        <div className="text-4xl">🔒</div>
        <p className="mt-3">
          Validez les leçons précédentes pour débloquer celle-ci.
        </p>
      </div>
    );
  }

  async function markComplete() {
    setBusy(true);
    setMsg(null);
    try {
      await api(`/lessons/${lesson.id}/complete`, { method: "POST" });
      await onProgress();
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-xl font-semibold">{lesson.title}</h2>
        {lesson.completed && (
          <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
            ✓ Terminée
          </span>
        )}
      </div>

      {lesson.type === "TEXT" && (
        <div className="prose dark:prose-invert whitespace-pre-wrap">
          {String((lesson.content as any).body ?? "")}
        </div>
      )}
      {lesson.type === "VIDEO" && (lesson.content as any).url && (
        <video
          src={String((lesson.content as any).url)}
          controls
          controlsList="nodownload"
          className="w-full rounded"
        />
      )}
      {lesson.type === "PDF" && (lesson.content as any).url && (
        <iframe
          src={String((lesson.content as any).url)}
          className="h-[600px] w-full rounded"
        />
      )}
      {lesson.type === "IMAGE" && (lesson.content as any).url && (
        <img
          src={String((lesson.content as any).url)}
          alt={lesson.title}
          className="rounded"
        />
      )}

      {lesson.type === "QUIZ" && lesson.quiz ? (
        <QuizRunner
          lesson={lesson}
          quiz={lesson.quiz}
          onFinished={onProgress}
        />
      ) : lesson.type === "QUIZ" ? (
        <p className="text-sm text-neutral-500">
          Ce quiz n'est pas encore configuré.
        </p>
      ) : (
        <div className="flex items-center gap-3">
          {!lesson.completed && (
            <button className="btn" onClick={markComplete} disabled={busy}>
              {busy ? "…" : "Marquer comme terminée"}
            </button>
          )}
          {msg && <span className="text-sm text-red-600">{msg}</span>}
        </div>
      )}
    </div>
  );
}

function QuizRunner({
  lesson,
  quiz,
  onFinished,
}: {
  lesson: Lesson;
  quiz: Quiz;
  onFinished: () => Promise<void>;
}) {
  const [answers, setAnswers] = useState<Record<string, Set<string>>>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    passingScore: number;
    isFinal: boolean;
    correctCount: number;
    totalQuestions: number;
    certificate: { id: string; issuedAt: string } | null;
  } | null>(null);

  function toggle(questionId: string, choiceId: string, multi: boolean) {
    setAnswers((prev) => {
      const next = new Set(prev[questionId] ?? []);
      if (multi) {
        next.has(choiceId) ? next.delete(choiceId) : next.add(choiceId);
      } else {
        next.clear();
        next.add(choiceId);
      }
      return { ...prev, [questionId]: next };
    });
  }

  async function submit() {
    setBusy(true);
    try {
      const payload = {
        answers: quiz.questions.map((q) => ({
          questionId: q.id,
          choiceIds: Array.from(answers[q.id] ?? []),
        })),
      };
      const res = await api<typeof result>(`/lessons/${lesson.id}/quiz/attempt`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setResult(res);
      await onFinished();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setAnswers({});
    setResult(null);
  }

  return (
    <div className="space-y-4">
      <div className="rounded border border-neutral-200 bg-neutral-50 p-3 text-sm dark:border-neutral-800 dark:bg-neutral-900">
        <strong>{quiz.isFinal ? "Examen final" : "Quiz"}</strong> — score
        minimum pour valider : {quiz.passingScore}%.
        {quiz.isFinal && (
          <span className="ml-1">
            Réussir cet examen délivre le certificat de formation.
          </span>
        )}
      </div>

      {quiz.questions.map((q, i) => (
        <div
          key={q.id}
          className="rounded border border-neutral-200 p-3 dark:border-neutral-800"
        >
          <div className="mb-2 font-medium">
            {i + 1}. {q.prompt}
          </div>
          <ul className="space-y-1">
            {q.choices.map((c) => {
              const picked = answers[q.id]?.has(c.id) ?? false;
              return (
                <li key={c.id}>
                  <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-neutral-50 dark:hover:bg-neutral-900">
                    <input
                      type={q.type === "SINGLE" ? "radio" : "checkbox"}
                      name={q.id}
                      checked={picked}
                      onChange={() => toggle(q.id, c.id, q.type === "MULTIPLE")}
                      disabled={!!result}
                    />
                    <span>{c.text}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {!result ? (
        <button className="btn" onClick={submit} disabled={busy}>
          {busy ? "Envoi…" : "Soumettre"}
        </button>
      ) : (
        <div
          className={`rounded p-3 text-sm ${
            result.passed
              ? "border border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
              : "border border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200"
          }`}
        >
          <div className="text-base font-semibold">
            {result.passed ? "Bravo, quiz validé !" : "Pas encore validé."}
          </div>
          <p>
            Score : {result.score}% ({result.correctCount}/{result.totalQuestions}
            ) — seuil : {result.passingScore}%.
          </p>
          {result.certificate && (
            <p className="mt-1">🏆 Certificat délivré.</p>
          )}
          <button className="btn-secondary mt-2" onClick={reset}>
            Recommencer
          </button>
        </div>
      )}
    </div>
  );
}
