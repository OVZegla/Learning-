"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Protected } from "@/components/Protected";
import { FileDrop } from "@/components/FileDrop";
import { api } from "@/lib/api";

type LessonType = "VIDEO" | "TEXT" | "PDF" | "IMAGE" | "QUIZ";
type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

interface QuizChoice {
  id: string;
  text: string;
  correct: boolean;
}

interface QuizQuestion {
  id?: string;
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
  quiz: Quiz | null;
}

interface Module {
  id: string;
  title: string;
  position: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  coverUrl: string | null;
  status: CourseStatus;
  requireSequentialProgress: boolean;
  modules: Module[];
}

export default function EditCoursePage() {
  return (
    <Protected roles={["ADMIN", "FORMATEUR"]}>
      <Editor />
    </Protected>
  );
}

function Editor() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setCourse(await api<Course>(`/courses/${id}`));
    } catch (e: any) {
      setError(e.message);
    }
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function saveMeta(e: FormEvent) {
    e.preventDefault();
    if (!course) return;
    setSaving(true);
    try {
      await api(`/courses/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: course.title,
          description: course.description ?? "",
          category: course.category ?? "",
          coverUrl: course.coverUrl ?? "",
          status: course.status,
          requireSequentialProgress: course.requireSequentialProgress,
        }),
      });
      await refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function addModule() {
    if (!course) return;
    const title = prompt("Titre du chapitre ?")?.trim();
    if (!title) return;
    await api(`/courses/${id}/modules`, {
      method: "POST",
      body: JSON.stringify({ title, position: course.modules.length + 1 }),
    });
    await refresh();
  }

  if (error) return <p className="text-red-600">{error}</p>;
  if (!course) return <p className="text-neutral-500">Chargement…</p>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/courses" className="text-sm text-neutral-500 hover:underline">
            ← Retour aux formations
          </Link>
          <h1 className="text-2xl font-semibold">Édition de la formation</h1>
        </div>
        <Link className="btn-secondary" href={`/courses/${id}`}>
          Aperçu apprenant
        </Link>
      </div>

      <form className="card space-y-3" onSubmit={saveMeta}>
        <h2 className="text-lg font-semibold">Informations générales</h2>
        <input
          className="input"
          placeholder="Titre"
          value={course.title}
          onChange={(e) => setCourse({ ...course, title: e.target.value })}
        />
        <textarea
          className="input"
          placeholder="Description"
          rows={3}
          value={course.description ?? ""}
          onChange={(e) => setCourse({ ...course, description: e.target.value })}
        />
        <input
          className="input"
          placeholder="Catégorie"
          value={course.category ?? ""}
          onChange={(e) => setCourse({ ...course, category: e.target.value })}
        />
        <div>
          <div className="field" style={{ marginBottom: 8 }}>
            <label>Bannière de la formation</label>
          </div>
          <FileDrop
            accept="image/*"
            value={course.coverUrl}
            onUploaded={(r) => setCourse({ ...course, coverUrl: r.url })}
            hint="PNG, JPEG, WEBP ou SVG · max 200 Mo"
          />
          {course.coverUrl && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ marginTop: 6 }}
              onClick={() => setCourse({ ...course, coverUrl: null })}
            >
              Retirer la bannière
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <span>Statut :</span>
            <select
              className="input w-auto"
              value={course.status}
              onChange={(e) =>
                setCourse({ ...course, status: e.target.value as CourseStatus })
              }
            >
              <option value="DRAFT">Brouillon</option>
              <option value="PUBLISHED">Publiée</option>
              <option value="ARCHIVED">Archivée</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={course.requireSequentialProgress}
              onChange={(e) =>
                setCourse({ ...course, requireSequentialProgress: e.target.checked })
              }
            />
            Obliger à valider les leçons dans l'ordre
          </label>
        </div>
        <button className="btn" disabled={saving}>
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Chapitres</h2>
          <button className="btn" onClick={addModule}>
            + Ajouter un chapitre
          </button>
        </div>
        {course.modules.length === 0 && (
          <p className="text-sm text-neutral-500">
            Aucun chapitre pour l'instant. Commencez par en ajouter un.
          </p>
        )}
        <div className="space-y-4">
          {course.modules.map((m, idx) => (
            <ModuleCard
              key={m.id}
              module={m}
              index={idx}
              total={course.modules.length}
              onChanged={refresh}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ModuleCard({
  module: mod,
  index,
  total,
  onChanged,
}: {
  module: Module;
  index: number;
  total: number;
  onChanged: () => Promise<void>;
}) {
  const [title, setTitle] = useState(mod.title);
  const [editing, setEditing] = useState(false);

  async function saveTitle() {
    await api(`/modules/${mod.id}`, {
      method: "PATCH",
      body: JSON.stringify({ title }),
    });
    setEditing(false);
    await onChanged();
  }

  async function remove() {
    if (!confirm("Supprimer ce chapitre et toutes ses leçons ?")) return;
    await api(`/modules/${mod.id}`, { method: "DELETE" });
    await onChanged();
  }

  async function move(delta: number) {
    const newPos = mod.position + delta;
    if (newPos < 1) return;
    await api(`/modules/${mod.id}`, {
      method: "PATCH",
      body: JSON.stringify({ position: newPos }),
    });
    await onChanged();
  }

  async function addLesson() {
    const title = prompt("Titre de la leçon ?")?.trim();
    if (!title) return;
    const type = (prompt("Type (TEXT, VIDEO, PDF, IMAGE, QUIZ) ?", "TEXT") || "")
      .toUpperCase()
      .trim();
    if (!["TEXT", "VIDEO", "PDF", "IMAGE", "QUIZ"].includes(type)) {
      alert("Type invalide.");
      return;
    }
    await api(`/modules/${mod.id}/lessons`, {
      method: "POST",
      body: JSON.stringify({
        title,
        position: mod.lessons.length + 1,
        type,
        content: {},
      }),
    });
    await onChanged();
  }

  return (
    <div className="card space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          {editing ? (
            <div className="flex gap-2">
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <button className="btn" onClick={saveTitle}>
                OK
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  setTitle(mod.title);
                  setEditing(false);
                }}
              >
                Annuler
              </button>
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-neutral-500">Chapitre {mod.position}</span>
              <h3 className="text-lg font-semibold">{mod.title}</h3>
              <button
                className="text-xs text-brand-accent hover:underline"
                onClick={() => setEditing(true)}
              >
                renommer
              </button>
            </div>
          )}
        </div>
        <div className="flex gap-1">
          <button
            className="btn-secondary px-2 py-1 text-xs"
            onClick={() => move(-1)}
            disabled={index === 0}
            aria-label="Monter"
          >
            ↑
          </button>
          <button
            className="btn-secondary px-2 py-1 text-xs"
            onClick={() => move(1)}
            disabled={index === total - 1}
            aria-label="Descendre"
          >
            ↓
          </button>
          <button className="btn-secondary px-2 py-1 text-xs" onClick={remove}>
            Supprimer
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {mod.lessons.map((l, i) => (
          <LessonRow
            key={l.id}
            lesson={l}
            index={i}
            total={mod.lessons.length}
            onChanged={onChanged}
          />
        ))}
      </div>

      <button className="btn-secondary" onClick={addLesson}>
        + Ajouter une leçon
      </button>
    </div>
  );
}

function LessonRow({
  lesson,
  index,
  total,
  onChanged,
}: {
  lesson: Lesson;
  index: number;
  total: number;
  onChanged: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  async function move(delta: number) {
    const newPos = lesson.position + delta;
    if (newPos < 1) return;
    await api(`/lessons/${lesson.id}`, {
      method: "PATCH",
      body: JSON.stringify({ position: newPos }),
    });
    await onChanged();
  }

  async function remove() {
    if (!confirm("Supprimer cette leçon ?")) return;
    await api(`/lessons/${lesson.id}`, { method: "DELETE" });
    await onChanged();
  }

  return (
    <div className="rounded border border-neutral-200 p-3 dark:border-neutral-800">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs dark:bg-neutral-800">
            {lesson.type}
          </span>
          <span className="font-medium">{lesson.title}</span>
          {lesson.quiz?.isFinal && (
            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
              Examen final
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <button
            className="btn-secondary px-2 py-1 text-xs"
            onClick={() => move(-1)}
            disabled={index === 0}
          >
            ↑
          </button>
          <button
            className="btn-secondary px-2 py-1 text-xs"
            onClick={() => move(1)}
            disabled={index === total - 1}
          >
            ↓
          </button>
          <button className="btn-secondary px-2 py-1 text-xs" onClick={() => setOpen((v) => !v)}>
            {open ? "Fermer" : "Éditer"}
          </button>
          <button className="btn-secondary px-2 py-1 text-xs" onClick={remove}>
            Supprimer
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-3">
          <LessonEditor lesson={lesson} onSaved={onChanged} />
        </div>
      )}
    </div>
  );
}

function LessonEditor({
  lesson,
  onSaved,
}: {
  lesson: Lesson;
  onSaved: () => Promise<void>;
}) {
  const [title, setTitle] = useState(lesson.title);
  const [type, setType] = useState<LessonType>(lesson.type);
  const [content, setContent] = useState<Record<string, any>>(lesson.content ?? {});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      await api(`/lessons/${lesson.id}`, {
        method: "PATCH",
        body: JSON.stringify({ title, type, content }),
      });
      setMsg("Enregistré.");
      await onSaved();
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <input
        className="input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre"
      />
      <div className="flex items-center gap-2">
        <label className="text-sm">Type :</label>
        <select
          className="input w-auto"
          value={type}
          onChange={(e) => setType(e.target.value as LessonType)}
        >
          <option value="TEXT">Texte</option>
          <option value="VIDEO">Vidéo</option>
          <option value="PDF">PDF</option>
          <option value="IMAGE">Image</option>
          <option value="QUIZ">Quiz / Examen</option>
        </select>
      </div>

      {type === "TEXT" && (
        <textarea
          className="input min-h-[160px]"
          placeholder="Contenu textuel de la leçon"
          value={(content.body as string) ?? ""}
          onChange={(e) => setContent({ ...content, body: e.target.value })}
        />
      )}
      {(type === "VIDEO" || type === "PDF" || type === "IMAGE") && (
        <FileDrop
          accept={
            type === "VIDEO"
              ? "video/*"
              : type === "PDF"
                ? "application/pdf"
                : "image/*"
          }
          value={(content.url as string) ?? null}
          onUploaded={(r) => setContent({ ...content, url: r.url })}
          preview={type === "VIDEO" ? "video" : type === "PDF" ? "pdf" : "image"}
          hint={
            type === "VIDEO"
              ? "MP4, WEBM ou MOV · max 200 Mo"
              : type === "PDF"
                ? "Document PDF · max 200 Mo"
                : "PNG, JPEG, WEBP ou SVG · max 200 Mo"
          }
        />
      )}

      <div className="flex items-center gap-2">
        <button className="btn" onClick={save} disabled={saving}>
          {saving ? "…" : "Enregistrer"}
        </button>
        {msg && <span className="text-sm text-neutral-500">{msg}</span>}
      </div>

      {type === "QUIZ" && (
        <div className="mt-4 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <QuizEditor
            lessonId={lesson.id}
            initial={lesson.quiz}
            onSaved={onSaved}
          />
        </div>
      )}
    </div>
  );
}

function QuizEditor({
  lessonId,
  initial,
  onSaved,
}: {
  lessonId: string;
  initial: Quiz | null;
  onSaved: () => Promise<void>;
}) {
  const [passingScore, setPassingScore] = useState(initial?.passingScore ?? 80);
  const [isFinal, setIsFinal] = useState(initial?.isFinal ?? false);
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    initial?.questions ?? [],
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const normalized = useMemo(
    () =>
      questions.map((q, idx) => ({
        ...q,
        position: idx + 1,
        choices: q.choices.map((c) => ({ ...c, id: c.id || cryptoId() })),
      })),
    [questions],
  );

  function addQuestion() {
    setQuestions([
      ...questions,
      {
        prompt: "Nouvelle question",
        type: "SINGLE",
        position: questions.length + 1,
        choices: [
          { id: cryptoId(), text: "Proposition A", correct: true },
          { id: cryptoId(), text: "Proposition B", correct: false },
        ],
      },
    ]);
  }

  function updateQ(i: number, patch: Partial<QuizQuestion>) {
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  }

  function removeQ(i: number) {
    setQuestions((qs) => qs.filter((_, idx) => idx !== i));
  }

  function addChoice(qi: number) {
    setQuestions((qs) =>
      qs.map((q, idx) =>
        idx === qi
          ? {
              ...q,
              choices: [
                ...q.choices,
                { id: cryptoId(), text: `Proposition ${q.choices.length + 1}`, correct: false },
              ],
            }
          : q,
      ),
    );
  }

  function updateChoice(qi: number, ci: number, patch: Partial<QuizChoice>) {
    setQuestions((qs) =>
      qs.map((q, idx) =>
        idx === qi
          ? {
              ...q,
              choices: q.choices.map((c, cidx) => (cidx === ci ? { ...c, ...patch } : c)),
            }
          : q,
      ),
    );
  }

  function removeChoice(qi: number, ci: number) {
    setQuestions((qs) =>
      qs.map((q, idx) =>
        idx === qi ? { ...q, choices: q.choices.filter((_, cidx) => cidx !== ci) } : q,
      ),
    );
  }

  function setSingleCorrect(qi: number, choiceId: string) {
    setQuestions((qs) =>
      qs.map((q, idx) =>
        idx === qi
          ? { ...q, choices: q.choices.map((c) => ({ ...c, correct: c.id === choiceId })) }
          : q,
      ),
    );
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      await api(`/lessons/${lessonId}/quiz`, {
        method: "PUT",
        body: JSON.stringify({
          passingScore,
          isFinal,
          questions: normalized,
        }),
      });
      setMsg("Quiz enregistré.");
      await onSaved();
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          Score minimum pour valider (%)
          <input
            className="input w-20"
            type="number"
            min={0}
            max={100}
            value={passingScore}
            onChange={(e) => setPassingScore(Number(e.target.value))}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isFinal}
            onChange={(e) => setIsFinal(e.target.checked)}
          />
          Examen final (délivre le certificat)
        </label>
      </div>

      {normalized.map((q, qi) => (
        <div
          key={qi}
          className="rounded border border-neutral-200 p-3 dark:border-neutral-800"
        >
          <div className="flex items-start gap-2">
            <span className="text-xs text-neutral-500">Q{qi + 1}</span>
            <textarea
              className="input flex-1"
              rows={2}
              value={q.prompt}
              onChange={(e) => updateQ(qi, { prompt: e.target.value })}
            />
            <button className="btn-secondary px-2 py-1 text-xs" onClick={() => removeQ(qi)}>
              Suppr.
            </button>
          </div>
          <div className="mt-2 flex items-center gap-3 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name={`type-${qi}`}
                checked={q.type === "SINGLE"}
                onChange={() => updateQ(qi, { type: "SINGLE" })}
              />
              Réponse unique
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name={`type-${qi}`}
                checked={q.type === "MULTIPLE"}
                onChange={() => updateQ(qi, { type: "MULTIPLE" })}
              />
              Réponses multiples
            </label>
          </div>
          <div className="mt-2 space-y-1">
            {q.choices.map((c, ci) => (
              <div key={c.id} className="flex items-center gap-2">
                {q.type === "SINGLE" ? (
                  <input
                    type="radio"
                    name={`correct-${qi}`}
                    checked={c.correct}
                    onChange={() => setSingleCorrect(qi, c.id)}
                  />
                ) : (
                  <input
                    type="checkbox"
                    checked={c.correct}
                    onChange={(e) => updateChoice(qi, ci, { correct: e.target.checked })}
                  />
                )}
                <input
                  className="input flex-1"
                  value={c.text}
                  onChange={(e) => updateChoice(qi, ci, { text: e.target.value })}
                />
                <button
                  className="btn-secondary px-2 py-1 text-xs"
                  onClick={() => removeChoice(qi, ci)}
                  disabled={q.choices.length <= 2}
                >
                  ×
                </button>
              </div>
            ))}
            <button className="btn-secondary px-2 py-1 text-xs" onClick={() => addChoice(qi)}>
              + proposition
            </button>
          </div>
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-2">
        <button className="btn-secondary" onClick={addQuestion}>
          + Ajouter une question
        </button>
        <button className="btn" onClick={save} disabled={saving}>
          {saving ? "…" : "Enregistrer le quiz"}
        </button>
        {msg && <span className="text-sm text-neutral-500">{msg}</span>}
      </div>
    </div>
  );
}

function cryptoId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}
