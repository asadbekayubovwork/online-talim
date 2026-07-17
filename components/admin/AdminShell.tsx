"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/components/AuthProvider";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  adminOnly?: boolean;
}

function Icon({ path }: { path: string }) {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
    </svg>
  );
}

export default function AdminShell({
  locale,
  children,
}: {
  locale: string;
  children: ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = user?.role === "ADMIN";
  const isInstructor = user?.role === "INSTRUCTOR";
  const isStaff = isAdmin || isInstructor;
  const base = `/${locale}/admin`;
  const adminOnlyPath =
    pathname === base ||
    pathname.startsWith(`${base}/users`) ||
    pathname.startsWith(`${base}/categories`) ||
    pathname.startsWith(`${base}/reviews`);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/${locale}/login`);
      return;
    }
    if (!isStaff) {
      router.replace(`/${locale}`);
      return;
    }
    if (isInstructor && adminOnlyPath) {
      router.replace(`${base}/courses`);
    }
  }, [loading, user, isStaff, isInstructor, adminOnlyPath, base, locale, router]);

  if (loading || !user || !isStaff || (isInstructor && adminOnlyPath)) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
          Boshqaruv paneli yuklanmoqda…
        </div>
      </div>
    );
  }

  const nav: NavItem[] = [
    {
      href: base,
      label: "Dashboard",
      adminOnly: true,
      icon: <Icon path="M3 12l9-9 9 9M5 10v10h14V10M9 20v-6h6v6" />,
    },
    {
      href: `${base}/users`,
      label: "Foydalanuvchilar",
      adminOnly: true,
      icon: <Icon path="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2m7-10a4 4 0 100-8 4 4 0 000 8zm13 10v-2a4 4 0 00-3-3.87m-1-7.13a4 4 0 010 7.75" />,
    },
    {
      href: `${base}/courses`,
      label: "Kurslar",
      icon: <Icon path="M4 19.5A2.5 2.5 0 016.5 17H20M4 4.5A2.5 2.5 0 016.5 2H20v15H6.5A2.5 2.5 0 004 19.5v-15z" />,
    },
    {
      href: `${base}/categories`,
      label: "Yo‘nalishlar",
      adminOnly: true,
      icon: <Icon path="M7 7h.01M3 4a1 1 0 011-1h5a2 2 0 011.414.586l9 9a2 2 0 010 2.828l-4 4a2 2 0 01-2.828 0l-9-9A2 2 0 013 9V4z" />,
    },
    {
      href: `${base}/reviews`,
      label: "Review va baholar",
      adminOnly: true,
      icon: <Icon path="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z" />,
    },
  ].filter((item) => isAdmin || !item.adminOnly);

  function active(href: string) {
    return href === base ? pathname === base : pathname.startsWith(href);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-5">
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Icon path="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </span>
            <div>
              <p className="font-bold text-slate-950">Boshqaruv paneli</p>
              <p className="text-xs text-slate-400">
                {isAdmin ? "Administrator" : "O‘qituvchi"}
              </p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active(item.href)
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-3">
          <Link href={`/${locale}/profile`} className="mb-2 block rounded-xl px-3 py-2.5 hover:bg-slate-50">
            <p className="truncate text-sm font-semibold text-slate-900">
              {user.firstName} {user.lastName}
            </p>
            <p className="mt-0.5 truncate text-xs text-slate-400">@{user.username}</p>
          </Link>
          <button
            type="button"
            onClick={async () => {
              await logout();
              router.replace(`/${locale}/login`);
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            <Icon path="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            Chiqish
          </button>
        </div>
      </aside>
      <main className="ml-64 min-w-0">
        <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
