"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Protected } from "@/components/Protected";
import { Icon } from "@/components/Icons";
import { QuestionsPanel } from "@/components/QuestionsPanel";
import { api } from "@/lib/api";

interface CourseMini {
  id: string;
  title: string;
  category?: string | null;
}

export default function CourseQuestionsPage() {
  return (
    <Protected>
      <Page />
    </Protected>
  );
}

function Page() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<CourseMini | null>(null);

  useEffect(() => {
    api<CourseMini>(`/courses/${id}`).then(setCourse).catch(() => setCourse({ id, title: "Formation" }));
  }, [id]);

  return (
    <section>
      <div style={{ marginBottom: 20 }}>
        <Link href="/questions" className="auth-link" style={{ fontSize: 13 }}>
          ← Toutes les formations
        </Link>
      </div>
      <div className="page-head">
        <div>
          {course?.category && <div className="course-cat mono">{course.category}</div>}
          <h1 className="page-title">{course?.title ?? "Formation"}</h1>
          <p className="page-sub">Questions posées par les apprenants et réponses du formateur.</p>
        </div>
        <Link href={`/courses/${id}`} className="btn btn-outline btn-sm">
          <Icon.book width={14} height={14} />
          Retour à la formation
        </Link>
      </div>

      <QuestionsPanel courseId={id} />
    </section>
  );
}
