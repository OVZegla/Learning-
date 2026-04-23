"use client";

import { useRef, useState, DragEvent, ChangeEvent } from "react";
import { apiUpload } from "@/lib/api";
import { Icon } from "./Icons";

type UploadResult = { url: string; mimeType: string; size: number; originalName: string };

export function FileDrop({
  accept,
  value,
  onUploaded,
  hint,
  preview = "auto",
}: {
  accept?: string;
  value?: string | null;
  onUploaded: (r: UploadResult) => void;
  hint?: string;
  preview?: "auto" | "image" | "video" | "pdf" | "none";
}) {
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setError(null);
    setBusy(true);
    try {
      const res = await apiUpload<UploadResult>("/uploads", file);
      onUploaded(res);
    } catch (e: any) {
      setError(e.message ?? "Échec du téléversement");
    } finally {
      setBusy(false);
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setOver(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  }

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload(file);
    e.target.value = "";
  }

  const kind = detectKind(preview, value);

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${over ? "var(--ink)" : "var(--line-2)"}`,
          borderRadius: 16,
          padding: 20,
          background: over ? "var(--bg-inset)" : "var(--bg-sunken)",
          cursor: "pointer",
          transition: "border-color 0.15s ease, background 0.15s ease",
          textAlign: "center",
        }}
      >
        {value && kind === "image" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" style={{ maxHeight: 200, maxWidth: "100%", borderRadius: 12, margin: "0 auto 10px" }} />
        )}
        {value && kind === "video" && (
          <video src={value} controls style={{ maxHeight: 200, maxWidth: "100%", borderRadius: 12, margin: "0 auto 10px", display: "block" }} />
        )}
        {value && kind === "pdf" && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 10, color: "var(--ink-2)" }}>
            <Icon.file width={18} height={18} />
            <span className="mono" style={{ fontSize: 13 }}>Document PDF téléversé</span>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "var(--ink-2)", fontSize: 14 }}>
          <Icon.plus width={16} height={16} />
          <span>
            {busy
              ? "Téléversement en cours…"
              : value
              ? "Remplacer le fichier"
              : "Glissez-déposez un fichier ou cliquez pour choisir"}
          </span>
        </div>
        {hint && <div style={{ marginTop: 6, fontSize: 12, color: "var(--ink-3)" }}>{hint}</div>}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={onPick}
          style={{ display: "none" }}
        />
      </div>
      {error && <p style={{ color: "var(--rose)", fontSize: 13, marginTop: 8 }}>{error}</p>}
    </div>
  );
}

function detectKind(preview: "auto" | "image" | "video" | "pdf" | "none", value: string | null | undefined) {
  if (!value || preview === "none") return null;
  if (preview !== "auto") return preview;
  const lower = value.toLowerCase();
  if (/\.(png|jpe?g|webp|gif|svg)$/.test(lower)) return "image";
  if (/\.(mp4|webm|mov)$/.test(lower)) return "video";
  if (/\.pdf$/.test(lower)) return "pdf";
  return null;
}
