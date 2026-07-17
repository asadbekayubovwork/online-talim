"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getApiErrorMessage } from "@/lib/auth";

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const locale = useLocale();
  const router = useRouter();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const user = await login({ username: identifier.trim(), password });
      const destination =
        user.role === "ADMIN"
          ? "admin"
          : user.role === "INSTRUCTOR"
            ? "admin/courses"
            : "my-courses";
      router.replace(`/${locale}/${destination}`);
    } catch (reason) {
      setError(getApiErrorMessage(reason, t("errorGeneric")));
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-md">
        <Link
          href={`/${locale}`}
          className="mb-8 inline-flex items-center gap-3 rounded-xl text-slate-900"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white shadow-sm">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.25v13m0-13C10.83 5.48 9.25 5 7.5 5S4.17 5.48 3 6.25v13C4.17 18.48 5.75 18 7.5 18s3.33.48 4.5 1.25m0-13C13.17 5.48 14.75 5 16.5 5s3.33.48 4.5 1.25v13C19.83 18.48 18.25 18 16.5 18s-3.33.48-4.5 1.25" />
            </svg>
          </span>
          <span className="font-bold">Abu-Hanifa akademiyasi</span>
        </Link>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-7">
            <p className="mb-2 text-sm font-semibold text-blue-600">Xush kelibsiz</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">{t("title")}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">{t("subtitle")}</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {error && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="identifier" className="mb-2 block text-sm font-medium text-slate-700">
                Email yoki foydalanuvchi nomi
              </label>
              <input
                id="identifier"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="email@example.com"
                required
                autoFocus
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                {t("password")}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Parolni yashirish" : "Parolni ko‘rsatish"}
                  className="absolute inset-y-0 right-0 grid w-12 place-items-center text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? "Yop" : "Ko‘r"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !identifier.trim() || !password}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              {submitting ? t("submitting") : t("submit")}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {t("noAccount")} {" "}
            <Link href={`/${locale}/register`} className="font-semibold text-blue-600 hover:text-blue-700">
              {t("register")}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
