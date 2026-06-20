"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  createCourse,
  getCourse,
  updateCourse,
  type CourseLevel,
} from "@/lib/admin";
import { getApiErrorMessage } from "@/lib/auth";

const LEVELS: { value: CourseLevel; label: string }[] = [
  { value: "BEGINNER", label: "Boshlang'ich" },
  { value: "INTERMEDIATE", label: "O'rta" },
  { value: "ADVANCED", label: "Yuqori" },
];

const inputCls =
  "w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400";

export default function CourseForm({
  locale,
  courseId,
}: {
  locale: string;
  courseId?: string;
}) {
  const router = useRouter();
  const editing = Boolean(courseId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [price, setPrice] = useState("0");
  const [level, setLevel] = useState<CourseLevel>("BEGINNER");
  const [isPublished, setIsPublished] = useState(false);

  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;
    getCourse(courseId)
      .then((c) => {
        setTitle(c.title);
        setDescription(c.description);
        setThumbnail(c.thumbnail ?? "");
        setPrice(String(c.price ?? 0));
        setLevel(c.level);
        setIsPublished(c.isPublished);
      })
      .catch((e) => setError(getApiErrorMessage(e, "Kursni yuklab bo'lmadi")))
      .finally(() => setLoading(false));
  }, [courseId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        thumbnail: thumbnail.trim() || undefined,
        price: Number(price) || 0,
        level,
      };
      if (editing && courseId) {
        await updateCourse(courseId, { ...payload, isPublished });
        router.push(`/${locale}/admin/courses`);
      } else {
        const created = await createCourse(payload);
        // Yaratgandan keyin darslar qo'shishga o'tamiz.
        router.push(`/${locale}/admin/courses/${created.id}/lessons`);
      }
      router.refresh();
    } catch (err) {
      setError(getApiErrorMessage(err, "Saqlashda xatolik yuz berdi"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-500">Yuklanmoqda...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Kurs nomi <span className="text-red-500">*</span>
        </label>
        <input
          className={inputCls}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Masalan: Hanafiy fiqh asoslari"
          required
          minLength={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Tavsif <span className="text-red-500">*</span>
        </label>
        <textarea
          className={inputCls + " min-h-[120px] resize-y"}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Kurs haqida qisqacha ma'lumot..."
          required
          minLength={10}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Muqova rasmi (URL)
        </label>
        <input
          className={inputCls}
          value={thumbnail}
          onChange={(e) => setThumbnail(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Narxi (so'm) — 0 = bepul
          </label>
          <input
            type="number"
            min={0}
            className={inputCls}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Daraja
          </label>
          <select
            className={inputCls + " bg-white cursor-pointer"}
            value={level}
            onChange={(e) => setLevel(e.target.value as CourseLevel)}
          >
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {editing && (
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 accent-blue-600"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          <span className="text-sm text-gray-700">
            E'lon qilingan (saytda ko'rinadi)
          </span>
        </label>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer"
        >
          {saving ? "Saqlanmoqda..." : editing ? "Saqlash" : "Kurs yaratish"}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/admin/courses`)}
          className="px-6 py-2.5 border border-gray-200 hover:border-gray-300 text-gray-600 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
        >
          Bekor qilish
        </button>
      </div>
    </form>
  );
}
