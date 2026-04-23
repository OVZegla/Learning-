"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Icon } from "./Icons";

interface QuestionItem {
  id: string;
  body: string;
  createdAt: string;
  resolvedAt: string | null;
  answerBody: string | null;
  answeredAt: string | null;
  asker: { id: string; name: string };
  answerBy: { id: string; name: string } | null;
}

interface ListResponse {
  items: QuestionItem[];
  canAnswer: boolean;
}

export function QuestionsPanel({ courseId }: { courseId: string }) {
  const [data, setData] = useState<ListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setData(await api<ListResponse>(`/courses/${courseId}/questions`));
    } catch (e: any) {
      setError(e.message);
    }
  }, [courseId]);

  useEffect(() => { refresh(); }, [refresh]);

  async function ask(e: FormEvent) {
    e.preventDefault();
    if (body.trim().length < 5) return;
    setBusy(true);
    try {
      await api(`/courses/${courseId}/questions`, {
        method: "POST",
        body: JSON.stringify({ body }),
      });
      setBody("");
      await refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (error) return <p style={{ color: "var(--rose)" }}>{error}</p>;
  if (!data) return <p style={{ color: "var(--ink-3)" }}>Chargement des questions…</p>;

  return (
    <div>
      <form onSubmit={ask} className="card" style={{ marginBottom: 20, padding: 18 }}>
        <div className="field" style={{ marginBottom: 10 }}>
          <label>Poser une question sur cette formation</label>
          <textarea
            rows={3}
            placeholder="Décrivez votre question en quelques phrases…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            minLength={5}
          />
        </div>
        <button className="btn btn-accent btn-sm" type="submit" disabled={busy || body.trim().length < 5}>
          {busy ? "Envoi…" : "Envoyer la question"}
          {!busy && <Icon.arrow width={14} height={14} />}
        </button>
      </form>

      {data.items.length === 0 ? (
        <p style={{ color: "var(--ink-3)", textAlign: "center", padding: 24 }}>
          Aucune question sur cette formation pour l'instant.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {data.items.map((q) => (
            <QuestionCard key={q.id} q={q} canAnswer={data.canAnswer} onChange={refresh} />
          ))}
        </div>
      )}
    </div>
  );
}

function QuestionCard({
  q,
  canAnswer,
  onChange,
}: {
  q: QuestionItem;
  canAnswer: boolean;
  onChange: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [answerBody, setAnswerBody] = useState(q.answerBody ?? "");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (answerBody.trim().length === 0) return;
    setBusy(true);
    try {
      await api(`/questions/${q.id}/answer`, {
        method: "POST",
        body: JSON.stringify({ body: answerBody }),
      });
      setEditing(false);
      await onChange();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleResolved() {
    try {
      await api(`/questions/${q.id}/resolved`, { method: "PATCH" });
      await onChange();
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function remove() {
    if (!confirm("Supprimer cette question ?")) return;
    try {
      await api(`/questions/${q.id}`, { method: "DELETE" });
      await onChange();
    } catch (e: any) {
      alert(e.message);
    }
  }

  const initials = q.asker.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span className="avatar-sm" style={{ background: "var(--accent-soft)", color: "var(--accent-ink)", border: "none", width: 32, height: 32 }}>
          {initials}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <strong style={{ fontSize: 14 }}>{q.asker.name}</strong>
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
              · {new Date(q.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
            </span>
            {q.resolvedAt && <span className="pill pill-mint">Résolue</span>}
          </div>
          <p style={{ margin: 0, fontSize: 14, whiteSpace: "pre-wrap", color: "var(--ink)" }}>{q.body}</p>
        </div>
        {canAnswer && (
          <button className="btn btn-ghost btn-xs" onClick={remove} title="Supprimer">
            <Icon.trash width={14} height={14} />
          </button>
        )}
      </div>

      {q.answerBody && !editing && (
        <div
          style={{
            marginTop: 14,
            marginLeft: 44,
            padding: 14,
            background: "var(--bg-sunken)",
            borderRadius: 12,
            border: "1px solid var(--line)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span
              className="avatar-sm"
              style={{ background: "var(--mint)", color: "var(--mint-ink)", border: "none", width: 24, height: 24, fontSize: 10 }}
            >
              <Icon.check width={12} height={12} />
            </span>
            <strong style={{ fontSize: 13 }}>{q.answerBy?.name ?? "Formateur"}</strong>
            {q.answeredAt && (
              <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                · {new Date(q.answeredAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
              </span>
            )}
          </div>
          <p style={{ margin: 0, fontSize: 14, whiteSpace: "pre-wrap", color: "var(--ink-2)" }}>{q.answerBody}</p>
        </div>
      )}

      {canAnswer && (
        <div style={{ marginTop: 12, marginLeft: 44 }}>
          {editing ? (
            <div>
              <div className="field">
                <textarea
                  rows={3}
                  placeholder="Votre réponse…"
                  value={answerBody}
                  onChange={(e) => setAnswerBody(e.target.value)}
                />
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button className="btn btn-accent btn-sm" onClick={submit} disabled={busy}>
                  {busy ? "Envoi…" : "Publier la réponse"}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>
                {q.answerBody ? "Modifier la réponse" : "Répondre"}
              </button>
              {q.answerBody && (
                <button className="btn btn-ghost btn-sm" onClick={toggleResolved}>
                  {q.resolvedAt ? "Rouvrir" : "Marquer comme résolue"}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
