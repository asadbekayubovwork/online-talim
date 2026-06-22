"use client";

import { useEffect, useState } from "react";
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
  type ApiCategory,
} from "@/lib/admin";
import { getApiErrorMessage } from "@/lib/auth";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    fetchCategories()
      .then(setCategories)
      .catch((e) => setError(getApiErrorMessage(e, "Yo'nalishlarni yuklab bo'lmadi")))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    setError(null);
    try {
      await createCategory(name);
      setNewName("");
      load();
    } catch (err) {
      setError(getApiErrorMessage(err, "Yo'nalish qo'shishda xatolik"));
    } finally {
      setCreating(false);
    }
  }

  function startEdit(c: ApiCategory) {
    setEditingId(c.id);
    setEditName(c.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
  }

  async function handleSaveEdit(id: string) {
    const name = editName.trim();
    if (!name) return;
    setSavingEdit(true);
    setError(null);
    try {
      await updateCategory(id, name);
      cancelEdit();
      load();
    } catch (err) {
      setError(getApiErrorMessage(err, "Tahrirlashda xatolik"));
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(c: ApiCategory) {
    if (
      !confirm(
        `"${c.name}" yo'nalishini o'chirasizmi? Unga biriktirilgan kurslar yo'nalishsiz qoladi.`
      )
    ) {
      return;
    }
    setDeletingId(c.id);
    try {
      await deleteCategory(c.id);
      setCategories((prev) => prev.filter((x) => x.id !== c.id));
    } catch (e) {
      alert(getApiErrorMessage(e, "O'chirishda xatolik"));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Yo'nalishlar</h1>
        <p className="text-gray-500 text-sm">Jami: {categories.length}</p>
      </div>

      {error && (
        <div className="px-4 py-3 mb-6 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Qo'shish formasi */}
      <form
        onSubmit={handleCreate}
        className="flex items-center gap-3 mb-6 bg-white rounded-2xl border border-gray-100 p-4"
      >
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Yangi yo'nalish nomi (masalan: Hadis darslari)"
          minLength={2}
          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400"
        />
        <button
          type="submit"
          disabled={creating || !newName.trim()}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
        >
          {creating ? "Qo'shilmoqda..." : "+ Qo'shish"}
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-gray-500">Yuklanmoqda...</p>
        ) : categories.length === 0 ? (
          <p className="p-10 text-center text-sm text-gray-500">
            Hali yo'nalishlar yo'q. Yuqoridagi formadan qo'shing.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="px-5 py-3 font-medium">Nomi</th>
                  <th className="px-5 py-3 font-medium">Slug</th>
                  <th className="px-5 py-3 font-medium">Kurslar</th>
                  <th className="px-5 py-3 font-medium text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {editingId === c.id ? (
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          minLength={2}
                          autoFocus
                          className="w-full max-w-xs px-3 py-1.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                        />
                      ) : (
                        c.name
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-400">{c.slug}</td>
                    <td className="px-5 py-3 text-gray-600">{c.courseCount}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {editingId === c.id ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(c.id)}
                              disabled={savingEdit || !editName.trim()}
                              className="px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              {savingEdit ? "..." : "Saqlash"}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            >
                              Bekor
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(c)}
                              className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            >
                              Tahrirlash
                            </button>
                            <button
                              onClick={() => handleDelete(c)}
                              disabled={deletingId === c.id}
                              className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              {deletingId === c.id ? "..." : "O'chirish"}
                            </button>
                          </>
                        )}
                      </div>
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
