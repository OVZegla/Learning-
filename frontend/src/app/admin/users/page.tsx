"use client";

import { useEffect, useState } from "react";
import { Protected } from "@/components/Protected";
import { api } from "@/lib/api";
import type { Role } from "@/lib/auth";

interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

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

  useEffect(() => {
    load();
  }, []);

  async function changeRole(id: string, role: Role) {
    await api(`/users/${id}/role`, { method: "PATCH", body: JSON.stringify({ role }) });
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    await api(`/users/${id}`, { method: "DELETE" });
    await load();
  }

  if (error) return <p className="text-red-600">{error}</p>;
  if (!users) return <p className="text-neutral-500">Chargement…</p>;

  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold">Utilisateurs</h1>
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase text-neutral-500">
          <tr>
            <th className="py-2">Nom</th>
            <th>Email</th>
            <th>Rôle</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-neutral-200 dark:border-neutral-800">
              <td className="py-2">{u.name}</td>
              <td>{u.email}</td>
              <td>
                <select
                  className="input py-1"
                  value={u.role}
                  onChange={(e) => changeRole(u.id, e.target.value as Role)}
                >
                  <option value="APPRENANT">APPRENANT</option>
                  <option value="FORMATEUR">FORMATEUR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </td>
              <td className="text-right">
                <button className="btn-secondary" onClick={() => remove(u.id)}>
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
