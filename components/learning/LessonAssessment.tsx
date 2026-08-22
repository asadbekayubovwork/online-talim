"use client";

import { useEffect, useState } from "react";
import type { ApiLesson } from "@/lib/admin";
import { getApiErrorMessage } from "@/lib/auth";
import { toast } from "@/components/ToastProvider";
import {
  downloadMaterial,
  getLearningLesson,
  getQuiz,
  submitQuiz,
  type PublicQuiz,
  type QuizResult,
} from "@/lib/learning";

function bytes(value: number): string {
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

/** "1 kun 4 soat", "1 soat 59 daqiqa", "45 daqiqa" — the wait before a retry. */
function formatRemaining(seconds: number): string {
  if (seconds >= 86400) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return hours ? `${days} kun ${hours} soat` : `${days} kun`;
  }
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return minutes ? `${hours} soat ${minutes} daqiqa` : `${hours} soat`;
  }
  if (seconds >= 60) return `${Math.floor(seconds / 60)} daqiqa`;
  return `${seconds} soniya`;
}

export default function LessonAssessment({
  lessonId,
  onPassed,
}: {
  lessonId: string;
  onPassed?: () => void;
}) {
  const [lesson, setLesson] = useState<ApiLesson | null>(null);
  const [quiz, setQuiz] = useState<PublicQuiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  // The quiz stays behind a button so it does not distract from the video.
  const [started, setStarted] = useState(false);

  // The newest answer wins: a fresh submit result overrides what the page loaded.
  const lockedUntilIso = result?.lockedUntil ?? quiz?.lockedUntil ?? null;
  const alreadyPassed = result?.passed ?? quiz?.passed ?? false;
  const remainingSeconds =
    lockedUntilIso && !alreadyPassed
      ? Math.max(0, Math.round((new Date(lockedUntilIso).getTime() - now) / 1000))
      : 0;
  const locked = remainingSeconds > 0;
  // A finished or cooling-down quiz opens on its own so the student sees where
  // they stand without having to press "start" again.
  const showQuiz = started || alreadyPassed || locked;

  useEffect(() => {
    if (!locked) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [locked]);

  useEffect(() => {
    let active = true;
    Promise.all([getLearningLesson(lessonId), getQuiz(lessonId)])
      .then(([lessonData, quizData]) => {
        if (!active) return;
        setLesson(lessonData);
        setQuiz(quizData);
      })
      .catch(
        (reason) =>
          active && toast.error(getApiErrorMessage(reason, "Dars ma’lumotlarini yuklab bo‘lmadi")),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [lessonId]);

  function choose(questionId: string, choiceId: string, multiple: boolean) {
    setAnswers((current) => {
      const selected = current[questionId] ?? [];
      return {
        ...current,
        [questionId]: multiple
          ? selected.includes(choiceId)
            ? selected.filter((id) => id !== choiceId)
            : [...selected, choiceId]
          : [choiceId],
      };
    });
  }

  async function handleSubmit() {
    if (!quiz) return;
    const unanswered = quiz.questions.find((question) => !(answers[question.id]?.length));
    if (unanswered) {
      toast.warning("Barcha savollarga javob bering.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await submitQuiz(lessonId, answers);
      setResult(response);
      if (response.passed) onPassed?.();
    } catch (reason) {
      toast.error(getApiErrorMessage(reason, "Test javoblarini yuborib bo‘lmadi"));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">Material va test yuklanmoqda…</div>;

  return (
    <div className="mt-7 space-y-6">
      {lesson?.materials?.length ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="font-bold text-slate-950">Dars materiallari</h2>
          <p className="mt-1 text-sm text-slate-500">Darsni mustahkamlash uchun biriktirilgan fayllar.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {lesson.materials.map((material) => (
              <button
                key={material.id}
                type="button"
                onClick={() => downloadMaterial(material.id, material.title, !material.isDownloadable)}
                className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-blue-300 hover:bg-blue-50/40"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-800">{material.title}</span>
                  <span className="mt-1 block text-xs text-slate-400">{bytes(material.sizeBytes)}</span>
                </span>
                <span className="shrink-0 text-xs font-semibold text-blue-600">{material.isDownloadable ? "Yuklash" : "Ochish"}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {quiz && !showQuiz && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="font-bold text-slate-950">Dars testi</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Darsni ko‘rib bo‘lgach, {quiz.questions.length} ta savoldan iborat testni ishlang.
            O‘tish bali — {quiz.passingScore}%. Testdan o‘tganingizdan so‘ng keyingi dars ochiladi.
          </p>
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Testni boshlash
          </button>
        </section>
      )}

      {quiz && showQuiz && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-950">{quiz.title}</h2>
              <p className="mt-1 text-sm text-slate-500">O‘tish bali: {quiz.passingScore}% · Urinish: {result?.attemptsUsed ?? quiz.attemptsUsed}{quiz.maxAttempts ? ` / ${quiz.maxAttempts}` : ""}</p>
            </div>
            {result && (
              <span className={`rounded-full px-3 py-1.5 text-sm font-bold ${result.passed ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                {result.score}%
              </span>
            )}
          </div>

          <div className="space-y-6">
            {quiz.questions.map((question, index) => (
              <fieldset key={question.id} disabled={submitting || alreadyPassed || locked}>
                <legend className="mb-3 text-sm font-semibold leading-6 text-slate-900">{index + 1}. {question.prompt}</legend>
                <div className="space-y-2">
                  {question.choices.map((choice) => {
                    const selected = answers[question.id]?.includes(choice.id) ?? false;
                    const multiple = question.type === "MULTIPLE";
                    return (
                      <label key={choice.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${selected ? "border-blue-400 bg-blue-50 text-blue-950" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                        <input type={multiple ? "checkbox" : "radio"} name={`question-${question.id}`} checked={selected} onChange={() => choose(question.id, choice.id, multiple)} className="h-4 w-4 accent-blue-600" />
                        {choice.text}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>

          {alreadyPassed && (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Testdan muvaffaqiyatli o‘tdingiz. Keyingi dars ochildi.
            </div>
          )}
          {result && !result.passed && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              O‘tish bali yetarli emas. Darsni takrorlab, qayta urinib ko‘ring.
            </div>
          )}
          {locked && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <span className="font-semibold">Test vaqtincha yopiq.</span> Qayta urinish{" "}
              <span className="font-semibold tabular-nums">{formatRemaining(remainingSeconds)}</span>dan
              keyin ochiladi. Shu vaqt ichida darsni qayta ko‘rib chiqing.
            </div>
          )}
          {!alreadyPassed && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || locked}
              className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Tekshirilmoqda…" : locked ? "Qayta urinish yopiq" : "Javoblarni tekshirish"}
            </button>
          )}
        </section>
      )}
    </div>
  );
}
