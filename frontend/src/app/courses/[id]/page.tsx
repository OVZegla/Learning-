"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Protected } from "@/components/Protected";
import { Icon } from "@/components/Icons";
import { api } from "@/lib/api";

type LessonType = "VIDEO" | "TEXT" | "PDF" | "IMAGE" | "QUIZ";

interface QuizChoice { id: string; text: string }
interface QuizQuestion { id: string; prompt: string; type: "SINGLE" | "MULTIPLE"; position: number; choices: QuizChoice[] }
interface Quiz { id: string; passingScore: number; isFinal: boolean; questions: QuizQuestion[] }
interface Lesson {
  id: string; title: string; position: number; type: LessonType;
  content: Record<string, any>; completed: boolean; locked: boolean; unlocked: boolean;
  quiz: Quiz | null;
}
interface Module { id: string; title: string; position: number; lessons: Lesson[] }
interface CourseDetail {
  id: string; title: string; description?: string | null;
  author: { id: string; name: string };
  requireSequentialProgress: boolean;
  canEdit: boolean;
  certificate: { id: string; issuedAt: string } | null;
  modules: Module[];
}

export default function CourseDetailPage() {
  return (
    <Protected>
      <CourseView />
    </Protected>
  );
}

function CourseView() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const c = await api<CourseDetail>(`/courses/${id}`);
      setCourse(c);
      setCurrentId((prev) => {
        if (prev && c.modules.some((m) => m.lessons.some((l) => l.id === prev))) return prev;
        const firstUnlocked = c.modules.flatMap((m) => m.lessons).find((l) => l.unlocked) ?? c.modules[0]?.lessons[0];
        return firstUnlocked?.id ?? null;
      });
    } catch (e: any) {
      setError(e.message);
    }
  }, [id]);

  useEffect(() => { refresh(); }, [refresh]);

  const current = useMemo(() => {
    if (!course || !currentId) return null;
    for (const m of course.modules) for (const l of m.lessons) if (l.id === currentId) return l;
    return null;
  }, [course, currentId]);

  const stats = useMemo(() => {
    if (!course) return { total: 0, done: 0 };
    const all = course.modules.flatMap((m) => m.lessons);
    return { total: all.length, done: all.filter((l) => l.completed).length };
  }, [course]);

  if (error) return <p style={{ color: "var(--rose)" }}>{error}</p>;
  if (!course) return <p style={{ color: "var(--ink-3)" }}>Chargement…</p>;

  const pct = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="course-layout">
      <aside className="course-side">
        <div style={{ marginBottom: 16 }}>
          <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Progression
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ fontSize: 14, color: "var(--ink-2)" }}>
              {stats.done}/{stats.total} leçons
            </span>
            <strong style={{ fontSize: 14 }}>{pct}%</strong>
          </div>
          <div className="course-progress-bar"><span style={{ width: `${pct}%` }} /></div>
        </div>

        {course.modules.map((m) => (
          <div key={m.id}>
            <div className="module-head mono">{m.title}</div>
            {m.lessons.map((l) => {
              const active = currentId === l.id;
              const lockedDisplay = l.locked && !course.canEdit;
              const state = l.completed ? "is-done" : lockedDisplay ? "is-locked" : "is-todo";
              return (
                <button
                  key={l.id}
                  className={`lesson-link ${state} ${active ? "is-active" : ""}`}
                  onClick={() => setCurrentId(l.id)}
                  disabled={lockedDisplay}
                  title={lockedDisplay ? "Terminez la leçon précédente" : l.title}
                >
                  <span className="lesson-icon">
                    {l.completed ? <Icon.check width={12} height={12} /> : lockedDisplay ? <Icon.lock width={12} height={12} /> : ""}
                  </span>
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {l.title}
                  </span>
                  {l.quiz?.isFinal && (
                    <span className="pill pill-accent" style={{ fontSize: 10, padding: "2px 6px" }}>EXAM</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </aside>

      <section className="course-main">
        <div className="page-head" style={{ marginBottom: 16 }}>
          <div>
            <h1 className="page-title">{course.title}</h1>
            {course.description && <p className="page-sub">{course.description}</p>}
          </div>
          {course.canEdit && (
            <Link className="btn btn-outline btn-sm" href={`/admin/courses/${course.id}/edit`}>
              <Icon.edit width={14} height={14} />
              Éditer la formation
            </Link>
          )}
        </div>

        {course.certificate && (
          <div
            className="card"
            style={{
              borderColor: "var(--mint)",
              background: "var(--mint-soft)",
              color: "var(--mint-ink)",
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 40, height: 40, borderRadius: 10,
                background: "var(--mint)", color: "var(--mint-ink)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Icon.award />
            </div>
            <div>
              <strong>Certificat obtenu</strong>{" "}
              <span className="mono" style={{ fontSize: 12 }}>
                · le {new Date(course.certificate.issuedAt).toLocaleDateString("fr-FR")}
              </span>
            </div>
          </div>
        )}

        <div className="card" style={{ minHeight: 400, padding: 28 }}>
          {current ? (
            <LessonView lesson={current} canEdit={course.canEdit} onProgress={refresh} />
          ) : (
            <p style={{ color: "var(--ink-3)" }}>Sélectionnez une leçon.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function LessonView({
  lesson,
  canEdit,
  onProgress,
}: {
  lesson: Lesson;
  canEdit: boolean;
  onProgress: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (lesson.locked && !canEdit) {
    return (
      <div style={{ padding: 60, textAlign: "center", color: "var(--ink-3)" }}>
        <div style={{ width: 56, height: 56, margin: "0 auto 16px", borderRadius: 16, background: "var(--bg-inset)", color: "var(--ink-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon.lock />
        </div>
        <p>Validez les leçons précédentes pour débloquer celle-ci.</p>
      </div>
    );
  }

  async function markComplete() {
    setBusy(true); setMsg(null);
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
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>
          {lesson.title}
        </h2>
        {lesson.completed && (
          <span className="pill pill-mint">
            <Icon.check width={12} height={12} />
            Terminée
          </span>
        )}
      </div>

      {lesson.type === "TEXT" && (
        <div style={{ whiteSpace: "pre-wrap", fontSize: 15, lineHeight: 1.6, color: "var(--ink-2)" }}>
          {String((lesson.content as any).body ?? "")}
        </div>
      )}
      {lesson.type === "VIDEO" && (lesson.content as any).url && (
        <video
          src={String((lesson.content as any).url)}
          controls
          controlsList="nodownload"
          style={{ width: "100%", borderRadius: 16, border: "1px solid var(--line)" }}
        />
      )}
      {lesson.type === "PDF" && (lesson.content as any).url && (
        <iframe
          src={String((lesson.content as any).url)}
          style={{ width: "100%", height: 600, borderRadius: 16, border: "1px solid var(--line)" }}
        />
      )}
      {lesson.type === "IMAGE" && (lesson.content as any).url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={String((lesson.content as any).url)}
          alt={lesson.title}
          style={{ width: "100%", borderRadius: 16, border: "1px solid var(--line)" }}
        />
      )}

      {lesson.type === "QUIZ" && lesson.quiz ? (
        <QuizRunner lesson={lesson} quiz={lesson.quiz} onFinished={onProgress} />
      ) : lesson.type === "QUIZ" ? (
        <p style={{ color: "var(--ink-3)" }}>Ce quiz n'est pas encore configuré.</p>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 24 }}>
          {!lesson.completed && (
            <button className="btn btn-accent" onClick={markComplete} disabled={busy}>
              {busy ? "Enregistrement…" : "Marquer comme terminée"}
              {!busy && <Icon.check width={16} height={16} />}
            </button>
          )}
          {msg && <span style={{ color: "var(--rose)", fontSize: 13 }}>{msg}</span>}
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
    score: number; passed: boolean; passingScore: number; isFinal: boolean;
    correctCount: number; totalQuestions: number;
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
    <div>
      <div
        style={{
          background: "var(--bg-sunken)",
          border: "1px solid var(--line)",
          borderRadius: 12,
          padding: 14,
          fontSize: 14,
          color: "var(--ink-2)",
          marginBottom: 20,
        }}
      >
        <strong style={{ color: "var(--ink)" }}>
          {quiz.isFinal ? "Examen final" : "Quiz"}
        </strong>{" "}
        — score minimum : {quiz.passingScore}%.
        {quiz.isFinal && " Cet examen délivre le certificat de formation."}
      </div>

      {quiz.questions.map((q, i) => (
        <div
          key={q.id}
          style={{
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: 18,
            marginBottom: 12,
            background: "var(--bg-raised)",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 12 }}>
            <span className="mono" style={{ color: "var(--ink-3)", marginRight: 8 }}>Q{i + 1}</span>
            {q.prompt}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {q.choices.map((c) => {
              const picked = answers[q.id]?.has(c.id) ?? false;
              return (
                <label
                  key={c.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    border: `1px solid ${picked ? "var(--ink)" : "var(--line)"}`,
                    borderRadius: 10,
                    cursor: result ? "default" : "pointer",
                    background: picked ? "var(--bg-inset)" : "var(--bg-raised)",
                    transition: "border-color 0.15s ease, background 0.15s ease",
                  }}
                >
                  <input
                    type={q.type === "SINGLE" ? "radio" : "checkbox"}
                    name={q.id}
                    checked={picked}
                    onChange={() => toggle(q.id, c.id, q.type === "MULTIPLE")}
                    disabled={!!result}
                    style={{ accentColor: "var(--ink)" }}
                  />
                  <span style={{ fontSize: 14 }}>{c.text}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}

      {!result ? (
        <button className="btn btn-accent" onClick={submit} disabled={busy}>
          {busy ? "Envoi…" : "Soumettre"}
          {!busy && <Icon.arrow />}
        </button>
      ) : (
        <div
          className="card"
          style={{
            borderColor: result.passed ? "var(--mint)" : "var(--rose)",
            background: result.passed ? "var(--mint-soft)" : "var(--rose-soft)",
            color: result.passed ? "var(--mint-ink)" : "var(--rose)",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
            {result.passed ? "Bravo, quiz validé !" : "Pas encore validé."}
          </div>
          <p style={{ margin: 0, fontSize: 14 }}>
            Score : <strong>{result.score}%</strong> ({result.correctCount}/{result.totalQuestions}) — seuil : {result.passingScore}%.
          </p>
          {result.certificate && (
            <p style={{ margin: "8px 0 0", fontSize: 14 }}>
              🏆 Certificat délivré.
            </p>
          )}
          <button className="btn btn-outline btn-sm" style={{ marginTop: 12 }} onClick={reset}>
            Recommencer
          </button>
        </div>
      )}
    </div>
  );
}
