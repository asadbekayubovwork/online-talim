"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useState, useCallback } from "react";

const MONTHS = [
  "", "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr",
];
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 80 }, (_, i) => currentYear - i);

interface FormValues {
  username: string;
  password: string;
  email: string;
  emailAgain: string;
  firstName: string;
  lastName: string;
  city: string;
  country: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  phone: string;
  universityId: string;
  whatsapp: string;
  nationality: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;
type Touched = Partial<Record<keyof FormValues, boolean>>;

const initial: FormValues = {
  username: "", password: "", email: "", emailAgain: "",
  firstName: "", lastName: "", city: "", country: "",
  birthDay: "", birthMonth: "", birthYear: "",
  phone: "", universityId: "", whatsapp: "", nationality: "",
};

function validate(v: FormValues): FormErrors {
  const e: FormErrors = {};
  if (!v.username.trim()) e.username = "Foydalanuvchi nomi majburiy";
  else if (v.username.length < 3) e.username = "Kamida 3 ta belgi bo'lishi kerak";
  else if (!/^[a-zA-Z0-9_]+$/.test(v.username)) e.username = "Faqat harf, raqam va _ bo'lishi mumkin";

  if (!v.password) e.password = "Parol majburiy";
  else if (v.password.length < 8) e.password = "Kamida 8 ta belgi bo'lishi kerak";

  if (!v.email.trim()) e.email = "Email majburiy";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) e.email = "Email formati noto'g'ri";

  if (!v.emailAgain.trim()) e.emailAgain = "Emailni tasdiqlang";
  else if (v.email !== v.emailAgain) e.emailAgain = "Emaillar mos kelmaydi";

  if (!v.firstName.trim()) e.firstName = "Ism majburiy";
  if (!v.lastName.trim()) e.lastName = "Familiya majburiy";

  if (!v.birthDay || !v.birthMonth || !v.birthYear)
    e.birthDay = "Tug'ilgan sanani to'liq kiriting";

  if (v.phone && !/^\+?[0-9\s\-()]{7,15}$/.test(v.phone))
    e.phone = "Telefon raqami noto'g'ri";

  if (v.whatsapp && !/^\+?[0-9\s\-()]{7,15}$/.test(v.whatsapp))
    e.whatsapp = "WhatsApp raqami noto'g'ri";

  if (!v.nationality.trim()) e.nationality = "Fuqarolik majburiy";

  return e;
}

// ─── UI helpers ────────────────────────────────────────────
function SectionHeader({ title, arabic }: { title: string; arabic?: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex flex-col">
        <span className="text-base font-semibold text-blue-700">{title}</span>
        {arabic && <span className="text-xs text-gray-400 mt-0.5" dir="rtl">{arabic}</span>}
      </div>
      <div className="flex-1 h-px bg-blue-100" />
    </div>
  );
}

function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-red-500 mt-1.5">
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {msg}
    </p>
  );
}

function Field({ label, arabic, children }: {
  label: string; arabic?: string; children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-2 sm:gap-4 items-center">
      <div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {arabic && <p className="text-xs text-gray-400 mt-0.5" dir="rtl">{arabic}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full px-4 py-2.5 rounded-lg border outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400 ${
    hasError
      ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100"
      : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
  }`;
}

function selectCls(hasError: boolean) {
  return `w-full px-4 py-2.5 rounded-lg border outline-none transition-all text-sm text-gray-700 bg-white cursor-pointer ${
    hasError
      ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100"
      : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
  }`;
}

// ─── Page ──────────────────────────────────────────────────
export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const locale = useLocale();

  const [values, setValues] = useState<FormValues>(initial);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Touched>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = useCallback((field: keyof FormValues, value: string) => {
    setValues((v) => {
      const next = { ...v, [field]: value };
      if (touched[field] || submitted) setErrors(validate(next));
      return next;
    });
  }, [touched, submitted]);

  const blur = useCallback((field: keyof FormValues) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors((e) => ({ ...e, ...validate(values) }));
  }, [values]);

  const show = (field: keyof FormValues) =>
    !!(errors[field] && (touched[field] || submitted));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      // submit logic here
      console.log("Submit", values);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-10">
        <Link href={`/${locale}`} className="flex items-center gap-2.5 w-fit">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="font-bold text-gray-900">Abu-Hanifa <span className="text-blue-500">akademiyasi</span></span>
        </Link>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-2xl">
          <div className="mb-6 text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{t("title")}</h1>
            <p className="text-gray-500 text-sm mt-2">{t("subtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* ── Section 1 ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-6">
              <SectionHeader title={t("section1")} />
              <div className="space-y-4">

                <Field label={t("username")}>
                  <input
                    type="text"
                    autoComplete="username"
                    placeholder={t("usernamePlaceholder")}
                    value={values.username}
                    onChange={(e) => set("username", e.target.value)}
                    onBlur={() => blur("username")}
                    className={inputCls(show("username"))}
                  />
                  <ErrorMsg msg={show("username") ? errors.username : undefined} />
                </Field>

                <Field label={t("password")}>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder={t("passwordPlaceholder")}
                      value={values.password}
                      onChange={(e) => set("password", e.target.value)}
                      onBlur={() => blur("password")}
                      className={inputCls(show("password")) + " pr-11"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {show("password")
                    ? <ErrorMsg msg={errors.password} />
                    : <p className="text-xs text-gray-400 mt-1.5">{t("passwordHint")}</p>
                  }
                </Field>
              </div>
            </div>

            {/* ── Section 2 ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-6">
              <SectionHeader title={t("section2")} />
              <div className="space-y-4">

                <Field label={t("email")}>
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder={t("emailPlaceholder")}
                    value={values.email}
                    onChange={(e) => set("email", e.target.value)}
                    onBlur={() => blur("email")}
                    className={inputCls(show("email"))}
                  />
                  <ErrorMsg msg={show("email") ? errors.email : undefined} />
                </Field>

                <Field label={t("emailAgain")}>
                  <input
                    type="email"
                    placeholder={t("emailAgainPlaceholder")}
                    value={values.emailAgain}
                    onChange={(e) => set("emailAgain", e.target.value)}
                    onBlur={() => blur("emailAgain")}
                    className={inputCls(show("emailAgain"))}
                  />
                  <ErrorMsg msg={show("emailAgain") ? errors.emailAgain : undefined} />
                </Field>

                <Field label={t("firstName")}>
                  <input
                    type="text"
                    autoComplete="given-name"
                    placeholder={t("firstNamePlaceholder")}
                    value={values.firstName}
                    onChange={(e) => set("firstName", e.target.value)}
                    onBlur={() => blur("firstName")}
                    className={inputCls(show("firstName"))}
                  />
                  <ErrorMsg msg={show("firstName") ? errors.firstName : undefined} />
                </Field>

                <Field label={t("lastName")}>
                  <input
                    type="text"
                    autoComplete="family-name"
                    placeholder={t("lastNamePlaceholder")}
                    value={values.lastName}
                    onChange={(e) => set("lastName", e.target.value)}
                    onBlur={() => blur("lastName")}
                    className={inputCls(show("lastName"))}
                  />
                  <ErrorMsg msg={show("lastName") ? errors.lastName : undefined} />
                </Field>

                <Field label={t("city")}>
                  <input
                    type="text"
                    autoComplete="address-level2"
                    placeholder={t("cityPlaceholder")}
                    value={values.city}
                    onChange={(e) => set("city", e.target.value)}
                    className={inputCls(false)}
                  />
                </Field>

                <Field label={t("country")}>
                  <select
                    value={values.country}
                    onChange={(e) => set("country", e.target.value)}
                    className={selectCls(false)}
                  >
                    <option value="" disabled>{t("countryPlaceholder")}</option>
                    <option value="uz">O'zbekiston</option>
                    <option value="tj">Tojikiston</option>
                    <option value="kg">Qirg'iziston</option>
                    <option value="kz">Qozog'iston</option>
                    <option value="ru">Rossiya</option>
                    <option value="other">Boshqa</option>
                  </select>
                </Field>
              </div>
            </div>

            {/* ── Section 3 ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-6">
              <SectionHeader title={t("section3")} arabic="البيانات الشخصية" />
              <div className="space-y-4">

                <Field label={t("birthdate")} arabic="تاريخ الميلاد">
                  <div className="flex items-center gap-2">
                    <select
                      value={values.birthDay}
                      onChange={(e) => set("birthDay", e.target.value)}
                      onBlur={() => blur("birthDay")}
                      className={selectCls(show("birthDay"))}
                    >
                      <option value="" disabled>{t("day")}</option>
                      {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select
                      value={values.birthMonth}
                      onChange={(e) => set("birthMonth", e.target.value)}
                      onBlur={() => blur("birthDay")}
                      className={selectCls(show("birthDay"))}
                    >
                      <option value="" disabled>{t("month")}</option>
                      {MONTHS.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                    </select>
                    <select
                      value={values.birthYear}
                      onChange={(e) => set("birthYear", e.target.value)}
                      onBlur={() => blur("birthDay")}
                      className={selectCls(show("birthDay"))}
                    >
                      <option value="" disabled>{t("year")}</option>
                      {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <ErrorMsg msg={show("birthDay") ? errors.birthDay : undefined} />
                </Field>

                <Field label={t("phone")} arabic="رقم الهاتف">
                  <input
                    type="tel"
                    autoComplete="tel"
                    placeholder={t("phonePlaceholder")}
                    value={values.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    onBlur={() => blur("phone")}
                    className={inputCls(show("phone"))}
                  />
                  <ErrorMsg msg={show("phone") ? errors.phone : undefined} />
                </Field>

                <Field label={t("universityId")} arabic="الرقم الجامعي (لطلاب كلية الفقه الحنفي)">
                  <input
                    type="text"
                    placeholder={t("universityIdPlaceholder")}
                    value={values.universityId}
                    onChange={(e) => set("universityId", e.target.value)}
                    className={inputCls(false)}
                  />
                </Field>

                <Field label={t("whatsapp")} arabic="رقم الواتساب (اختياري)">
                  <input
                    type="tel"
                    placeholder={t("whatsappPlaceholder")}
                    value={values.whatsapp}
                    onChange={(e) => set("whatsapp", e.target.value)}
                    onBlur={() => blur("whatsapp")}
                    className={inputCls(show("whatsapp"))}
                  />
                  <ErrorMsg msg={show("whatsapp") ? errors.whatsapp : undefined} />
                </Field>

                <Field label={t("nationality")} arabic="الجنسية">
                  <input
                    type="text"
                    placeholder={t("nationalityPlaceholder")}
                    value={values.nationality}
                    onChange={(e) => set("nationality", e.target.value)}
                    onBlur={() => blur("nationality")}
                    className={inputCls(show("nationality"))}
                  />
                  <ErrorMsg msg={show("nationality") ? errors.nationality : undefined} />
                </Field>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 pb-6">
              <button
                type="submit"
                className="w-full sm:w-auto flex-1 py-3 px-8 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold rounded-xl transition-all duration-200 shadow-md shadow-blue-100 cursor-pointer"
              >
                {t("submit")}
              </button>
              <Link
                href={`/${locale}/login`}
                className="w-full sm:w-auto px-8 py-3 text-center border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800 font-semibold rounded-xl transition-all duration-200 text-sm"
              >
                {t("cancel")}
              </Link>
            </div>

            <p className="text-center text-sm text-gray-500 pb-4">
              {t("hasAccount")}{" "}
              <Link href={`/${locale}/login`} className="text-blue-600 hover:text-blue-700 font-semibold">
                {t("loginLink")}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
