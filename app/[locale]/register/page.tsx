"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import PasswordInput from "@/components/PasswordInput";
import { getApiErrorMessage, type RegisterPayload } from "@/lib/auth";

interface FormValues {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  phone: string;
}

type Field = keyof FormValues;
type FormErrors = Partial<Record<Field, string>>;
type Touched = Partial<Record<Field, boolean>>;

const initial: FormValues = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  phone: "",
};

const PHONE_PATTERN = /^\+?[0-9\s\-()]{7,15}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Error keys under `auth.register`, resolved to text at render time. */
function validate(v: FormValues): FormErrors {
  const e: FormErrors = {};

  if (!v.firstName.trim()) e.firstName = "firstNameRequired";
  if (!v.lastName.trim()) e.lastName = "lastNameRequired";

  if (!v.username.trim()) e.username = "usernameRequired";
  else if (v.username.trim().length < 3) e.username = "usernameTooShort";
  else if (!/^[a-zA-Z0-9_]+$/.test(v.username.trim())) e.username = "usernameInvalid";

  if (!v.email.trim()) e.email = "emailRequired";
  else if (!EMAIL_PATTERN.test(v.email.trim())) e.email = "emailInvalid";

  if (!v.password) e.password = "passwordRequired";
  else if (v.password.length < 8) e.password = "passwordTooShort";

  // Phone is optional; only its format is checked when something was typed.
  if (v.phone.trim() && !PHONE_PATTERN.test(v.phone.trim())) e.phone = "phoneInvalid";

  return e;
}

function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
      <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {msg}
    </p>
  );
}

function inputCls(hasError: boolean) {
  return `w-full rounded-xl border px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 ${
    hasError
      ? "border-red-400 focus:border-red-400 focus:ring-4 focus:ring-red-100"
      : "border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
  }`;
}

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const locale = useLocale();
  const router = useRouter();
  const { register } = useAuth();

  const [values, setValues] = useState<FormValues>(initial);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Touched>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const set = useCallback((field: Field, value: string) => {
    setValues((current) => {
      const next = { ...current, [field]: value };
      setErrors(validate(next));
      return next;
    });
  }, []);

  const blur = useCallback((field: Field) => {
    setTouched((current) => ({ ...current, [field]: true }));
  }, []);

  // An error only surfaces once the field has been visited or submit was tried,
  // so the form does not shout at someone still filling in the first box.
  const errorFor = (field: Field) => {
    const key = errors[field];
    if (!key || !(touched[field] || submitted)) return undefined;
    return t(key);
  };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;
    setSubmitted(true);
    setServerError(null);

    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const payload: RegisterPayload = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      username: values.username.trim(),
      email: values.email.trim(),
      password: values.password,
      ...(values.phone.trim() && { phone: values.phone.trim() }),
    };

    setSubmitting(true);
    try {
      await register(payload);
      router.replace(`/${locale}/my-courses`);
    } catch (reason) {
      setServerError(getApiErrorMessage(reason, t("errorGeneric")));
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          href={`/${locale}`}
          className="mx-auto mb-8 flex w-fit items-center gap-3 rounded-xl text-slate-900"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white shadow-sm">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.25v13m0-13C10.83 5.48 9.25 5 7.5 5S4.17 5.48 3 6.25v13C4.17 18.48 5.75 18 7.5 18s3.33.48 4.5 1.25m0-13C13.17 5.48 14.75 5 16.5 5s3.33.48 4.5 1.25v13C19.83 18.48 18.25 18 16.5 18s-3.33.48-4.5 1.25" />
            </svg>
          </span>
          <span className="font-bold">Abu-Hanifa akademiyasi</span>
        </Link>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-7">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">{t("title")}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">{t("subtitle")}</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div aria-live="polite">
              {serverError && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {serverError}
                </div>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-slate-700">
                  {t("firstName")}
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  placeholder={t("firstNamePlaceholder")}
                  value={values.firstName}
                  onChange={(event) => set("firstName", event.target.value)}
                  onBlur={() => blur("firstName")}
                  autoFocus
                  className={inputCls(!!errorFor("firstName"))}
                />
                <ErrorMsg msg={errorFor("firstName")} />
              </div>

              <div>
                <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-slate-700">
                  {t("lastName")}
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  placeholder={t("lastNamePlaceholder")}
                  value={values.lastName}
                  onChange={(event) => set("lastName", event.target.value)}
                  onBlur={() => blur("lastName")}
                  className={inputCls(!!errorFor("lastName"))}
                />
                <ErrorMsg msg={errorFor("lastName")} />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-medium text-slate-700">
                {t("username")}
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder={t("usernamePlaceholder")}
                value={values.username}
                onChange={(event) => set("username", event.target.value)}
                onBlur={() => blur("username")}
                className={inputCls(!!errorFor("username"))}
              />
              <ErrorMsg msg={errorFor("username")} />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                {t("email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder={t("emailPlaceholder")}
                value={values.email}
                onChange={(event) => set("email", event.target.value)}
                onBlur={() => blur("email")}
                className={inputCls(!!errorFor("email"))}
              />
              <ErrorMsg msg={errorFor("email")} />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                {t("password")}
              </label>
              <PasswordInput
                id="password"
                name="password"
                autoComplete="new-password"
                placeholder={t("passwordPlaceholder")}
                value={values.password}
                onChange={(event) => set("password", event.target.value)}
                onBlur={() => blur("password")}
                showLabel={t("showPassword")}
                hideLabel={t("hidePassword")}
                className={`${inputCls(!!errorFor("password"))} pr-14`}
              />
              {errorFor("password") ? (
                <ErrorMsg msg={errorFor("password")} />
              ) : (
                <p className="mt-1.5 text-xs text-slate-400">{t("passwordHint")}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-700">
                {t("phoneOptional")}
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder={t("phonePlaceholder")}
                value={values.phone}
                onChange={(event) => set("phone", event.target.value)}
                onBlur={() => blur("phone")}
                className={inputCls(!!errorFor("phone"))}
              />
              <ErrorMsg msg={errorFor("phone")} />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              {submitting ? t("submitting") : t("submit")}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {t("hasAccount")}{" "}
            <Link href={`/${locale}/login`} className="font-semibold text-blue-600 hover:text-blue-700">
              {t("loginLink")}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
