"use client";

import { useEffect, useState } from "react";
import { Protected } from "@/components/Protected";
import { Icon } from "@/components/Icons";
import { api } from "@/lib/api";
import type { Role } from "@/lib/auth";

interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

const ROLE_PILL: Record<Role, string> = {
  ADMIN: "pill pill-plum",
  FORMATEUR: "pill pill-accent",
  APPRENANT: "pill pill-mint",
};

export default function AdminUsersPage() {
  return (
    <Protected roles={["ADMIN"]}>
      <Users />
    </Protected>
  );
}

function Users() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setUsers(await api<User[]>("/users"));
    } catch (e: any) {
      setError(e.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function changeRole(id: string, role: Role) {
    await api(`/users/${id}/role`, { method: "PATCH", body: JSON.stringify({ role }) });
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    await api(`/users/${id}`, { method: "DELETE" });
    await load();
  }

  if (error) return <p style={{ color: "var(--rose)" }}>{error}</p>;
  if (!users) return <p style={{ color: "var(--ink-3)" }}>Chargement…</p>;

  return (
    <section>
      <div className="page-head">
        <div>
          <h1 className="page-title">Utilisateurs</h1>
          <p className="page-sub">Gérez les rôles et les accès de votre organisation.</p>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Rôle actuel</th>
            <th>Modifier</th>
            <th className="col-right"></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const initials = u.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
            return (
              <tr key={u.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="avatar-sm" style={{ background: "var(--accent-soft)", color: "var(--accent-ink)", border: "none" }}>
                      {initials}
                    </span>
                    <span style={{ fontWeight: 500 }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ color: "var(--ink-2)" }}>{u.email}</td>
                <td>
                  <span className={ROLE_PILL[u.role]}>{u.role}</span>
                </td>
                <td>
                  <select
                    className="input"
                    style={{ width: "auto", padding: "6px 10px", fontSize: 13 }}
                    value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value as Role)}
                  >
                    <option value="APPRENANT">APPRENANT</option>
                    <option value="FORMATEUR">FORMATEUR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td className="col-right">
                  <button className="btn btn-danger btn-sm" onClick={() => remove(u.id)}>
                    <Icon.trash width={14} height={14} />
                    Supprimer
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
