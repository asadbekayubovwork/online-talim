"use client";

import { useEffect, useMemo, useState } from "react";
import { listUsers, updateAdminUser, type AdminUser } from "@/lib/admin";
import { getApiErrorMessage } from "@/lib/auth";

const roleLabel: Record<string, string> = {
  ADMIN: "Administrator",
  INSTRUCTOR: "O‘qituvchi",
  STUDENT: "Talaba",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listUsers()
      .then(setUsers)
      .catch((reason) => setError(getApiErrorMessage(reason, "Foydalanuvchilarni yuklab bo‘lmadi")))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return users.filter((user) => {
      const roleMatch = role === "ALL" || user.role === role;
      const searchMatch =
        !search ||
        user.username.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(search);
      return roleMatch && searchMatch;
    });
  }, [users, query, role]);

  async function saveUser(
    user: AdminUser,
    input: { role?: "STUDENT" | "INSTRUCTOR" | "ADMIN"; isActive?: boolean },
  ) {
    setSaving(user.id);
    setError(null);
    try {
      const updated = await updateAdminUser(user.id, input);
      setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (reason) {
      setError(getApiErrorMessage(reason, "Foydalanuvchini yangilab bo‘lmadi"));
    } finally {
      setSaving(null);
    }
  }

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-blue-600">Kirish va rollar</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">Foydalanuvchilar</h1>
          <p className="mt-2 text-sm text-slate-500">Jami {users.length} ta hisob. Rol va faollik holatini boshqaring.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-blue-50 px-3 py-1.5 font-semibold text-blue-700">Talaba: {users.filter((item) => item.role === "STUDENT").length}</span>
          <span className="rounded-full bg-amber-50 px-3 py-1.5 font-semibold text-amber-700">O‘qituvchi: {users.filter((item) => item.role === "INSTRUCTOR").length}</span>
          <span className="rounded-full bg-violet-50 px-3 py-1.5 font-semibold text-violet-700">Admin: {users.filter((item) => item.role === "ADMIN").length}</span>
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_220px]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Username, email yoki ism bo‘yicha qidirish…"
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
        <select value={role} onChange={(event) => setRole(event.target.value)} className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
          <option value="ALL">Barcha rollar</option>
          <option value="STUDENT">Talabalar</option>
          <option value="INSTRUCTOR">O‘qituvchilar</option>
          <option value="ADMIN">Administratorlar</option>
        </select>
      </div>

      {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Yuklanmoqda…</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">Mos foydalanuvchi topilmadi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Foydalanuvchi</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Rol</th>
                  <th className="px-5 py-3 font-semibold">Holati</th>
                  <th className="px-5 py-3 font-semibold">Ro‘yxatdan o‘tgan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{user.firstName} {user.lastName}</p>
                      <p className="mt-1 text-xs text-slate-400">@{user.username}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{user.email}</td>
                    <td className="px-5 py-4">
                      <select
                        value={user.role}
                        disabled={saving === user.id}
                        onChange={(event) => saveUser(user, { role: event.target.value as "STUDENT" | "INSTRUCTOR" | "ADMIN" })}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500"
                        aria-label={`${user.username} rolini o‘zgartirish`}
                      >
                        <option value="STUDENT">{roleLabel.STUDENT}</option>
                        <option value="INSTRUCTOR">{roleLabel.INSTRUCTOR}</option>
                        <option value="ADMIN">{roleLabel.ADMIN}</option>
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        disabled={saving === user.id}
                        onClick={() => saveUser(user, { isActive: !user.isActive })}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${user.isActive ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                      >
                        {saving === user.id ? "Saqlanmoqda…" : user.isActive ? "Faol" : "Bloklangan"}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-slate-400">{user.createdAt ? new Date(user.createdAt).toLocaleDateString("uz-UZ") : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
