"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  attachMaterial,
  createLesson,
  deleteMaterial,
  getCourse,
  getLesson,
  updateLesson,
  updateMaterial,
  uploadAsset,
  type ApiLesson,
  type CourseSection,
  type LessonMaterial,
} from "@/lib/admin";
import { getApiErrorMessage } from "@/lib/auth";
import { toast } from "@/components/ToastProvider";
import { extractYoutubeId, youtubeThumbnail } from "@/lib/youtube";

const fieldClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

const MATERIAL_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "text/plain",
];

interface UploadState {
  label: string;
  percent: number;
  phase: "uploading" | "processing" | "ready" | "failed";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[index]}`;
}

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
  const [existing, setExisting] = useState<ApiLesson | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [sectionId, setSectionId] = useState("");
  const [materialRows, setMaterialRows] = useState<LessonMaterial[]>([]);
  const [order, setOrder] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [materials, setMaterials] = useState<File[]>([]);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState | null>(null);

  useEffect(() => {
    getCourse(courseId)
      .then((course) => {
        const rows = (course.sections ?? []).map((section) => ({
          ...section,
          description: null,
        }));
        setSections(rows);
        setSectionId((current) => current || rows[0]?.id || "");
      })
      .catch((reason) => toast.error(getApiErrorMessage(reason, "Bo‘limlarni yuklab bo‘lmadi")));
  }, [courseId]);

  useEffect(() => {
    if (!lessonId) return;
    getLesson(lessonId)
      .then((lesson) => {
        setExisting(lesson);
        setTitle(lesson.title);
        setDescription(lesson.description ?? "");
        setSectionId(lesson.sectionId);
        setMaterialRows(lesson.materials ?? []);
        setOrder(String(lesson.order ?? ""));
        setIsPreview(lesson.isPreview);
        setVideoUrl(lesson.videoUrl ?? "");
        // An uploaded video carries its own measured duration, so only a
        // YouTube lesson pre-fills the manual field.
        if (!lesson.videoAssetId && lesson.duration) {
          setDurationMinutes(String(Math.round(lesson.duration / 60)));
        }
      })
      .catch((reason) => toast.error(getApiErrorMessage(reason, "Darsni yuklab bo‘lmadi")))
      .finally(() => setLoading(false));
  }, [lessonId]);

  const materialSummary = useMemo(
    () => materials.map((file) => `${file.name} (${formatBytes(file.size)})`).join(", "),
    [materials],
  );

  const trimmedVideoUrl = videoUrl.trim();
  const youtubeId = useMemo(() => extractYoutubeId(trimmedVideoUrl), [trimmedVideoUrl]);
  const videoLinkInvalid = Boolean(trimmedVideoUrl) && !youtubeId;

  function validateInput(): string | null {
    if (videoLinkInvalid) {
      return "YouTube havolasi noto‘g‘ri. Masalan: https://www.youtube.com/watch?v=VIDEO_ID";
    }
    const invalidMaterial = materials.find(
      (file) => !MATERIAL_TYPES.includes(file.type) && !file.name.toLowerCase().endsWith(".zip"),
    );
    if (invalidMaterial) return `${invalidMaterial.name}: bu fayl turi qo‘llab-quvvatlanmaydi.`;
    const oversized = materials.find((file) => file.size > 100 * 1024 * 1024);
    if (oversized) return `${oversized.name}: material hajmi 100 MB dan oshmasligi kerak.`;
    return null;
  }

  async function uploadMaterials(targetLessonId: string): Promise<void> {
    const initialCount = materialRows.length;
    for (const [index, file] of materials.entries()) {
      setUploadState({ label: file.name, percent: 0, phase: "uploading" });
      const asset = await uploadAsset(file, "DOCUMENT", (percent) =>
        setUploadState({ label: file.name, percent, phase: "uploading" }),
      );
      const attached = await attachMaterial(targetLessonId, {
        assetId: asset.id,
        title: file.name.replace(/\.[^/.]+$/, ""),
        order: initialCount + index,
        isDownloadable: true,
      });
      setMaterialRows((current) => [...current, attached]);
      setUploadState({ label: file.name, percent: 100, phase: "ready" });
    }
  }

  async function removeMaterial(material: LessonMaterial) {
    if (!lessonId || !window.confirm(`“${material.title}” materialini o‘chirasizmi?`)) return;
    setSaving(true);
    try {
      await deleteMaterial(lessonId, material.id);
      setMaterialRows((current) => current.filter((item) => item.id !== material.id));
    } catch (reason) {
      toast.error(getApiErrorMessage(reason, "Materialni o‘chirib bo‘lmadi"));
    } finally {
      setSaving(false);
    }
  }

  async function toggleDownload(material: LessonMaterial) {
    if (!lessonId) return;
    setSaving(true);
    try {
      const updated = await updateMaterial(lessonId, material.id, {
        isDownloadable: !material.isDownloadable,
      });
      setMaterialRows((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (reason) {
      toast.error(getApiErrorMessage(reason, "Material holatini yangilab bo‘lmadi"));
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const inputError = validateInput();
    if (inputError) {
      toast.warning(inputError);
      return;
    }
    setSaving(true);
    try {
      const minutes = durationMinutes === "" ? null : Number(durationMinutes);
      const input = {
        title: title.trim(),
        description: description.trim() || undefined,
        sectionId: sectionId || undefined,
        order: order === "" ? undefined : Number(order),
        isPreview,
        videoUrl: trimmedVideoUrl || null,
        videoDurationSeconds: minutes === null ? null : Math.round(minutes * 60),
      };
      const lesson = editing && lessonId
        ? await updateLesson(lessonId, input)
        : await createLesson(courseId, input);
      await uploadMaterials(lesson.id);
      toast.success(editing ? "Dars saqlandi" : "Dars yaratildi", lesson.title);
      router.push(`/${locale}/admin/courses/${courseId}/lessons`);
      router.refresh();
    } catch (reason) {
      setUploadState((current) =>
        current ? { ...current, phase: "failed" } : null,
      );
      toast.error(getApiErrorMessage(reason, "Darsni saqlashda xatolik yuz berdi"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Yuklanmoqda...</p>;

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="mb-5">
          <h2 className="font-bold text-slate-950">Dars ma’lumotlari</h2>
          <p className="mt-1 text-sm text-slate-500">Nomi, tavsifi va kursdagi tartibini kiriting.</p>
        </div>
        <div className="space-y-5">
          <div>
            <label htmlFor="lesson-title" className="mb-2 block text-sm font-medium text-slate-700">Dars nomi</label>
            <input
              id="lesson-title"
              className={fieldClass}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Masalan: Tahoratning farzlari"
              required
              minLength={2}
            />
          </div>
          <div>
            <label htmlFor="lesson-description" className="mb-2 block text-sm font-medium text-slate-700">Qisqacha tavsif</label>
            <textarea
              id="lesson-description"
              className={`${fieldClass} min-h-28 resize-y`}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Talaba bu darsda nimani o‘rganadi?"
            />
          </div>
          <div>
            <label htmlFor="lesson-section" className="mb-2 block text-sm font-medium text-slate-700">Bo‘lim</label>
            <select
              id="lesson-section"
              className={fieldClass}
              value={sectionId}
              onChange={(event) => setSectionId(event.target.value)}
              required
            >
              <option value="" disabled>Bo‘limni tanlang</option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>{section.order + 1}. {section.title}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="lesson-order" className="mb-2 block text-sm font-medium text-slate-700">Tartib raqami</label>
              <input
                id="lesson-order"
                type="number"
                min={0}
                className={fieldClass}
                value={order}
                onChange={(event) => setOrder(event.target.value)}
                placeholder="Bo‘sh qoldirilsa oxiriga qo‘shiladi"
              />
            </div>
            <label className="flex items-center gap-3 self-end rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={isPreview}
                onChange={(event) => setIsPreview(event.target.checked)}
                className="h-4 w-4 accent-blue-600"
              />
              Ro‘yxatdan o‘tmasdan ko‘rish mumkin
            </label>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="mb-5">
          <h2 className="font-bold text-slate-950">Dars videosi (YouTube)</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Video fayl yuklash vaqtincha o‘chirilgan. Darsga YouTube havolasini qo‘ying — talabalar
            uni saytning o‘zida ko‘radi.
          </p>
        </div>

        {existing?.videoAssetId && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Bu darsga ilgari yuklangan video biriktirilgan va u ishlashda davom etadi. YouTube
            havolasi qo‘shilsa, talabaga o‘sha havola ko‘rsatiladi.
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label htmlFor="lesson-video-url" className="mb-2 block text-sm font-medium text-slate-700">
              YouTube havolasi
            </label>
            <input
              id="lesson-video-url"
              type="url"
              inputMode="url"
              className={`${fieldClass} ${videoLinkInvalid ? "border-red-400 focus:border-red-500 focus:ring-red-100" : ""}`}
              value={videoUrl}
              onChange={(event) => setVideoUrl(event.target.value)}
              placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
              aria-invalid={videoLinkInvalid}
              aria-describedby="lesson-video-url-help"
            />
            <p id="lesson-video-url-help" className={`mt-2 text-xs leading-5 ${videoLinkInvalid ? "text-red-600" : "text-slate-500"}`}>
              {videoLinkInvalid
                ? "Havola noto‘g‘ri. watch, youtu.be, shorts yoki embed ko‘rinishidagi YouTube havolasini kiriting."
                : "watch, youtu.be, shorts va embed havolalari qabul qilinadi. Bo‘sh qoldirilsa, darsda video bo‘lmaydi."}
            </p>
          </div>

          {youtubeId && (
            <div className="flex flex-col gap-4 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={youtubeThumbnail(youtubeId)}
                alt=""
                className="h-24 w-40 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">Video topildi</p>
                <p className="mt-1 truncate text-xs text-slate-500">ID: {youtubeId}</p>
                <a
                  href={`https://www.youtube.com/watch?v=${youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex text-xs font-semibold text-blue-700 hover:underline"
                >
                  YouTube’da tekshirish →
                </a>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="lesson-duration" className="mb-2 block text-sm font-medium text-slate-700">
              Video davomiyligi (daqiqa)
            </label>
            <input
              id="lesson-duration"
              type="number"
              min={0}
              className={`${fieldClass} sm:max-w-xs`}
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(event.target.value)}
              placeholder="Masalan: 12"
              aria-describedby="lesson-duration-help"
            />
            <p id="lesson-duration-help" className="mt-2 text-xs leading-5 text-slate-500">
              Ixtiyoriy. Kurs tarkibida ko‘rsatiladi va kiritilgan bo‘lsa, talaba darsni yakunlash
              uchun videoning kamida 90 foizini ko‘rishi shart bo‘ladi.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="mb-5">
          <h2 className="font-bold text-slate-950">Dars materiallari</h2>
          <p className="mt-1 text-sm text-slate-500">Bir darsga bir nechta PDF, DOCX, PPTX, ZIP yoki TXT fayl biriktirish mumkin.</p>
        </div>
        {materialRows.length ? (
          <ul className="mb-4 space-y-2">
            {materialRows.map((material) => (
              <li key={material.id} className="flex flex-col gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-slate-700">{material.title}</p>
                  <p className="mt-1 text-xs text-slate-400">{formatBytes(material.sizeBytes)} · {material.isDownloadable ? "Yuklab olish mumkin" : "Faqat ko‘rish"}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" disabled={saving} onClick={() => toggleDownload(material)} className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-blue-700 ring-1 ring-slate-200 hover:bg-blue-50 disabled:opacity-50">{material.isDownloadable ? "Yuklashni yopish" : "Yuklashni ochish"}</button>
                  <button type="button" disabled={saving} onClick={() => removeMaterial(material)} className="rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">O‘chirish</button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
        <label className="block cursor-pointer rounded-xl border border-slate-300 px-4 py-4 transition hover:border-blue-400 hover:bg-blue-50/40">
          <input
            type="file"
            multiple
            accept=".pdf,.docx,.pptx,.zip,.txt,application/pdf,text/plain"
            className="sr-only"
            onChange={(event) => setMaterials(Array.from(event.target.files ?? []))}
          />
          <span className="font-medium text-slate-700">Materiallarni tanlang</span>
          <span className="ml-2 text-sm text-slate-400">har biri maksimal 100 MB</span>
        </label>
        {materialSummary && <p className="mt-3 text-sm leading-6 text-slate-500">{materialSummary}</p>}
      </section>

      {uploadState && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <div className="mb-2 flex items-center justify-between gap-4 text-sm">
            <span className="truncate font-medium text-blue-950">{uploadState.label}</span>
            <span className="shrink-0 text-blue-700">{uploadState.percent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-blue-100">
            <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${uploadState.percent}%` }} />
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving || !title.trim() || videoLinkInvalid}
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saqlanmoqda…" : editing ? "O‘zgarishlarni saqlash" : "Darsni yaratish"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => router.push(`/${locale}/admin/courses/${courseId}/lessons`)}
          className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          Bekor qilish
        </button>
      </div>
    </form>
  );
}
