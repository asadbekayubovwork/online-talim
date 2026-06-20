"use client";

import { useEffect, useMemo, useState } from "react";
import { listUsers, type AdminUser } from "@/lib/admin";
import { getApiErrorMessage } from "@/lib/auth";

const ROLE_BADGE: Record<string, string> = {
  ADMIN: "bg-purple-50 text-purple-700",
  TEACHER: "bg-amber-50 text-amber-700",
  STUDENT: "bg-blue-50 text-blue-700",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    listUsers()
      .then(setUsers)
      .catch((e) => setError(getApiErrorMessage(e, "Foydalanuvchilarni yuklab bo'lmadi")))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q)
    );
  }, [users, query]);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Foydalanuvchilar</h1>
      <p className="text-gray-500 text-sm mb-6">Jami: {users.length}</p>

      <input
        className="w-full max-w-sm px-4 py-2.5 mb-5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
        placeholder="Qidirish (username, email, ism)..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {error && (
        <div className="px-4 py-3 mb-6 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-gray-500">Yuklanmoqda...</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">Foydalanuvchi topilmadi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="px-5 py-3 font-medium">Username</th>
                  <th className="px-5 py-3 font-medium">Ism-familiya</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Rol</th>
                  <th className="px-5 py-3 font-medium">Ro'yxatdan o'tgan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">@{u.username}</td>
                    <td className="px-5 py-3 text-gray-700">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="px-5 py-3 text-gray-500">{u.email}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          ROLE_BADGE[u.role] ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                    </td>
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
