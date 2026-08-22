"use client";

import { useEffect, useState } from "react";
import {
  getAdminQuiz,
  saveQuiz,
  type QuestionType,
  type QuizChoiceInput,
  type QuizInput,
  type QuizQuestionInput,
} from "@/lib/admin";
import { getApiErrorMessage } from "@/lib/auth";
import { toast } from "@/components/ToastProvider";

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

function newChoice(order: number): QuizChoiceInput {
  return { text: "", isCorrect: false, order };
}

function newQuestion(order: number): QuizQuestionInput {
  return {
    type: "SINGLE",
    prompt: "",
    explanation: "",
    order,
    points: 1,
    choices: [newChoice(0), newChoice(1)],
  };
}

export default function QuizBuilder({ lessonId }: { lessonId: string }) {
  const [quiz, setQuiz] = useState<QuizInput>({
    title: "Dars testi",
    passingScore: 70,
    maxAttempts: null,
    requiredToUnlockNext: true,
    questions: [newQuestion(0)],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAdminQuiz(lessonId)
      .then((data) => {
        if (data) setQuiz(data);
      })
      .catch((reason) => toast.error(getApiErrorMessage(reason, "Testni yuklab bo‘lmadi")))
      .finally(() => setLoading(false));
  }, [lessonId]);

  function updateQuestion(index: number, patch: Partial<QuizQuestionInput>) {
    setQuiz((current) => ({
      ...current,
      questions: current.questions.map((question, questionIndex) =>
        questionIndex === index ? { ...question, ...patch } : question,
      ),
    }));
  }

  function updateChoice(questionIndex: number, choiceIndex: number, patch: Partial<QuizChoiceInput>) {
    const question = quiz.questions[questionIndex];
    const choices = question.choices.map((choice, index) => ({
      ...choice,
      ...(index === choiceIndex ? patch : {}),
      isCorrect:
        patch.isCorrect && question.type !== "MULTIPLE"
          ? index === choiceIndex
          : index === choiceIndex
            ? patch.isCorrect ?? choice.isCorrect
            : choice.isCorrect,
    }));
    updateQuestion(questionIndex, { choices });
  }

  function changeType(questionIndex: number, type: QuestionType) {
    const current = quiz.questions[questionIndex];
    const choices = type === "TRUE_FALSE"
      ? [
          { text: "To‘g‘ri", isCorrect: true, order: 0 },
          { text: "Noto‘g‘ri", isCorrect: false, order: 1 },
        ]
      : current.choices.map((choice, index) => ({
          ...choice,
          order: index,
          isCorrect: type === "MULTIPLE" ? choice.isCorrect : index === 0,
        }));
    updateQuestion(questionIndex, { type, choices });
  }

  function validate(): string | null {
    if (!quiz.title.trim()) return "Test nomini kiriting.";
    if (!quiz.questions.length) return "Kamida bitta savol bo‘lishi kerak.";
    for (const [index, question] of quiz.questions.entries()) {
      if (!question.prompt.trim()) return `${index + 1}-savol matnini kiriting.`;
      if (question.choices.some((choice) => !choice.text.trim())) return `${index + 1}-savolda bo‘sh javob bor.`;
      if (!question.choices.some((choice) => choice.isCorrect)) return `${index + 1}-savol uchun to‘g‘ri javobni belgilang.`;
      if (question.type !== "MULTIPLE" && question.choices.filter((choice) => choice.isCorrect).length !== 1) {
        return `${index + 1}-savolda faqat bitta to‘g‘ri javob bo‘lishi kerak.`;
      }
    }
    return null;
  }

  async function handleSave() {
    const validation = validate();
    if (validation) {
      toast.warning(validation);
      return;
    }
    setSaving(true);
    try {
      await saveQuiz(lessonId, {
        ...quiz,
        title: quiz.title.trim(),
        questions: quiz.questions.map((question, questionIndex) => ({
          ...question,
          order: questionIndex,
          prompt: question.prompt.trim(),
          choices: question.choices.map((choice, choiceIndex) => ({
            ...choice,
            order: choiceIndex,
            text: choice.text.trim(),
          })),
        })),
      });
      toast.success("Test saqlandi", quiz.title.trim());
    } catch (reason) {
      toast.error(getApiErrorMessage(reason, "Testni saqlashda xatolik yuz berdi"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Test yuklanmoqda...</p>;

  return (
    <div className="max-w-4xl space-y-6">

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="sm:col-span-3">
            <label className="mb-2 block text-sm font-medium text-slate-700">Test nomi</label>
            <input className={inputClass} value={quiz.title} onChange={(event) => setQuiz({ ...quiz, title: event.target.value })} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">O‘tish bali (%)</label>
            <input type="number" min={1} max={100} className={inputClass} value={quiz.passingScore} onChange={(event) => setQuiz({ ...quiz, passingScore: Number(event.target.value) })} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Urinishlar soni</label>
            <input type="number" min={1} className={inputClass} value={quiz.maxAttempts ?? ""} placeholder="Cheklanmagan" onChange={(event) => setQuiz({ ...quiz, maxAttempts: event.target.value ? Number(event.target.value) : null })} />
          </div>
          <label className="flex items-center gap-3 self-end rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
            <input type="checkbox" checked={quiz.requiredToUnlockNext} onChange={(event) => setQuiz({ ...quiz, requiredToUnlockNext: event.target.checked })} className="h-4 w-4 accent-blue-600" />
            Keyingi dars uchun majburiy
          </label>
        </div>
      </section>

      {quiz.questions.map((question, questionIndex) => (
        <section key={question.id ?? questionIndex} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-bold text-slate-950">{questionIndex + 1}-savol</h2>
            <button type="button" disabled={quiz.questions.length === 1} onClick={() => setQuiz({ ...quiz, questions: quiz.questions.filter((_, index) => index !== questionIndex) })} className="text-sm font-medium text-red-600 disabled:cursor-not-allowed disabled:opacity-40">Savolni o‘chirish</button>
          </div>
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-[1fr_180px_100px]">
              <input className={inputClass} value={question.prompt} onChange={(event) => updateQuestion(questionIndex, { prompt: event.target.value })} placeholder="Savol matni" />
              <select className={inputClass} value={question.type} onChange={(event) => changeType(questionIndex, event.target.value as QuestionType)}>
                <option value="SINGLE">Bitta javob</option>
                <option value="MULTIPLE">Bir nechta javob</option>
                <option value="TRUE_FALSE">To‘g‘ri / noto‘g‘ri</option>
              </select>
              <input type="number" min={1} max={100} className={inputClass} value={question.points} onChange={(event) => updateQuestion(questionIndex, { points: Number(event.target.value) })} title="Ball" />
            </div>
            <textarea className={`${inputClass} min-h-20 resize-y`} value={question.explanation ?? ""} onChange={(event) => updateQuestion(questionIndex, { explanation: event.target.value })} placeholder="Javobdan keyingi izoh (ixtiyoriy)" />

            <div className="space-y-3">
              {question.choices.map((choice, choiceIndex) => (
                <div key={choice.id ?? choiceIndex} className="flex items-center gap-3">
                  <input
                    type={question.type === "MULTIPLE" ? "checkbox" : "radio"}
                    name={`correct-${questionIndex}`}
                    checked={choice.isCorrect}
                    onChange={(event) => updateChoice(questionIndex, choiceIndex, { isCorrect: event.target.checked })}
                    className="h-4 w-4 shrink-0 accent-emerald-600"
                    aria-label="To‘g‘ri javob"
                  />
                  <input className={inputClass} value={choice.text} onChange={(event) => updateChoice(questionIndex, choiceIndex, { text: event.target.value })} placeholder={`Javob ${choiceIndex + 1}`} />
                  {question.type !== "TRUE_FALSE" && (
                    <button type="button" disabled={question.choices.length <= 2} onClick={() => updateQuestion(questionIndex, { choices: question.choices.filter((_, index) => index !== choiceIndex) })} className="shrink-0 rounded-lg px-2 py-2 text-sm text-red-600 disabled:opacity-30">O‘chirish</button>
                  )}
                </div>
              ))}
            </div>
            {question.type !== "TRUE_FALSE" && (
              <button type="button" onClick={() => updateQuestion(questionIndex, { choices: [...question.choices, newChoice(question.choices.length)] })} className="text-sm font-semibold text-blue-600 hover:text-blue-700">+ Javob varianti</button>
            )}
          </div>
        </section>
      ))}

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => setQuiz({ ...quiz, questions: [...quiz.questions, newQuestion(quiz.questions.length)] })} className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100">+ Savol qo‘shish</button>
        <button type="button" onClick={handleSave} disabled={saving} className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? "Saqlanmoqda…" : "Testni saqlash"}</button>
      </div>
    </div>
  );
}
