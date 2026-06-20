"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  createLesson,
  getLesson,
  updateLesson,
} from "@/lib/admin";
import { getApiErrorMessage } from "@/lib/auth";

const inputCls =
  "w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400";

export default function LessonForm({
  locale,
  courseId,
  lessonId,
}: {
  locale: string;
  courseId: string;
  lessonId?: string;
}) {
  const router = useRouter();
  const editing = Boolean(lessonId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState("0");
  const [order, setOrder] = useState("");
  const [isPreview, setIsPreview] = useState(false);

  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lessonId) return;
    getLesson(lessonId)
      .then((l) => {
        setTitle(l.title);
        setDescription(l.description ?? "");
        setVideoUrl(l.videoUrl ?? "");
        setDuration(String(l.duration ?? 0));
        setOrder(String(l.order ?? ""));
        setIsPreview(l.isPreview);
      })
      .catch((e) => setError(getApiErrorMessage(e, "Darsni yuklab bo'lmadi")))
      .finally(() => setLoading(false));
  }, [lessonId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        videoUrl: videoUrl.trim() || undefined,
        duration: Number(duration) || 0,
        order: order === "" ? undefined : Number(order),
        isPreview,
      };
      if (editing && lessonId) {
        await updateLesson(lessonId, payload);
      } else {
        await createLesson(courseId, payload);
      }
      router.push(`/${locale}/admin/courses/${courseId}/lessons`);
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
          Dars nomi <span className="text-red-500">*</span>
        </label>
        <input
          className={inputCls}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Masalan: 1-dars: Kirish"
          required
          minLength={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Video havolasi (URL)
        </label>
        <input
          className={inputCls}
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
        />
        <p className="text-xs text-gray-400 mt-1.5">
          YouTube, Vimeo yoki to'g'ridan-to'g'ri video URL.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Tavsif
        </label>
        <textarea
          className={inputCls + " min-h-[90px] resize-y"}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Dars haqida qisqacha (ixtiyoriy)"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Davomiyligi (sekund)
          </label>
          <input
            type="number"
            min={0}
            className={inputCls}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Tartib raqami
          </label>
          <input
            type="number"
            min={0}
            className={inputCls}
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            placeholder="Bo'sh = oxiriga qo'shiladi"
          />
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          className="w-4 h-4 accent-blue-600"
          checked={isPreview}
          onChange={(e) => setIsPreview(e.target.checked)}
        />
        <span className="text-sm text-gray-700">
          Bepul ko'rish (ro'yxatdan o'tmaganlar uchun ham ochiq)
        </span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer"
        >
          {saving ? "Saqlanmoqda..." : editing ? "Saqlash" : "Dars qo'shish"}
        </button>
        <button
          type="button"
          onClick={() =>
            router.push(`/${locale}/admin/courses/${courseId}/lessons`)
          }
          className="px-6 py-2.5 border border-gray-200 hover:border-gray-300 text-gray-600 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
        >
          Bekor qilish
        </button>
      </div>
    </form>
  );
}
