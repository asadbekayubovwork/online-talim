"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "@/components/ToastProvider";
import { changePassword, getApiErrorMessage, updateProfile } from "@/lib/auth";

const fieldClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

export default function ProfilePage() {
  const locale = useLocale();
  const router = useRouter();
  const { user, loading, refreshUser } = useAuth();
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    city: "",
    country: "",
    phone: "",
    universityId: "",
    whatsapp: "",
    nationality: "",
  });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [saving, setSaving] = useState<"profile" | "password" | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/${locale}/login`);
      return;
    }
    setProfile({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      city: user.city ?? "",
      country: user.country ?? "",
      phone: user.phone ?? "",
      universityId: user.universityId ?? "",
      whatsapp: user.whatsapp ?? "",
      nationality: user.nationality ?? "",
    });
  }, [loading, user, locale, router]);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving("profile");
    try {
      await updateProfile(profile);
      await refreshUser();
      toast.success("Profil saqlandi", "Ma’lumotlaringiz yangilandi.");
    } catch (reason) {
      toast.error(getApiErrorMessage(reason, "Profilni saqlab bo‘lmadi"));
    } finally {
      setSaving(null);
    }
  }

  async function savePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving("password");
    try {
      await changePassword(passwords);
      setPasswords({ currentPassword: "", newPassword: "" });
      toast.success("Parol yangilandi", "Iltimos, yangi parol bilan qayta kiring.");
      router.replace(`/${locale}/login`);
    } catch (reason) {
      toast.error(getApiErrorMessage(reason, "Parolni yangilab bo‘lmadi"));
    } finally {
      setSaving(null);
    }
  }

  if (loading || !user) {
    return <div className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">Yuklanmoqda…</div>;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 pb-16 pt-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="mb-8">
            <p className="text-sm font-semibold text-blue-600">Shaxsiy kabinet</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950">Profil va xavfsizlik</h1>
            <p className="mt-2 text-sm text-slate-500">O‘quv profilingiz va kirish parolini boshqaring.</p>
          </div>


          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <form onSubmit={saveProfile} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">Shaxsiy ma’lumotlar</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {([
                  ["firstName", "Ism"],
                  ["lastName", "Familiya"],
                  ["city", "Shahar"],
                  ["country", "Davlat"],
                  ["phone", "Telefon"],
                  ["whatsapp", "WhatsApp"],
                  ["universityId", "Talaba / universitet ID"],
                  ["nationality", "Millat"],
                ] as const).map(([key, label]) => (
                  <label key={key} className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
                    <input
                      className={fieldClass}
                      value={profile[key]}
                      onChange={(event) => setProfile((current) => ({ ...current, [key]: event.target.value }))}
                      required={key === "firstName" || key === "lastName"}
                    />
                  </label>
                ))}
              </div>
              <button disabled={saving !== null} className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                {saving === "profile" ? "Saqlanmoqda…" : "Profilni saqlash"}
              </button>
            </form>

            <form onSubmit={savePassword} className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">Parolni yangilash</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Yangi parol kamida 8 ta belgi, harf va raqamdan iborat bo‘lsin.</p>
              <label className="mt-5 block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Hozirgi parol</span>
                <input type="password" autoComplete="current-password" className={fieldClass} value={passwords.currentPassword} onChange={(event) => setPasswords((current) => ({ ...current, currentPassword: event.target.value }))} required minLength={8} />
              </label>
              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Yangi parol</span>
                <input type="password" autoComplete="new-password" className={fieldClass} value={passwords.newPassword} onChange={(event) => setPasswords((current) => ({ ...current, newPassword: event.target.value }))} required minLength={8} />
              </label>
              <button disabled={saving !== null} className="mt-6 w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
                {saving === "password" ? "Yangilanmoqda…" : "Parolni yangilash"}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
