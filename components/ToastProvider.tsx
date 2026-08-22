"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: number;
  type: ToastType;
  title: string;
  content?: string;
  duration: number;
}

/**
 * Same surface as the Vue project's `useToast()` composable, so calls read
 * identically on both sides: `toast.error(title, content?, duration?)`.
 */
export interface ToastApi {
  success: (title: string, content?: string, duration?: number) => void;
  error: (title: string, content?: string, duration?: number) => void;
  warning: (title: string, content?: string, duration?: number) => void;
  info: (title: string, content?: string, duration?: number) => void;
}

const DEFAULT_DURATION: Record<ToastType, number> = {
  success: 3000,
  error: 4000,
  warning: 3000,
  info: 3000,
};

const STYLE: Record<ToastType, { ring: string; icon: string; glyph: string }> = {
  success: { ring: "ring-emerald-100", icon: "bg-emerald-50 text-emerald-600", glyph: "✓" },
  error: { ring: "ring-red-100", icon: "bg-red-50 text-red-600", glyph: "!" },
  warning: { ring: "ring-amber-100", icon: "bg-amber-50 text-amber-600", glyph: "!" },
  info: { ring: "ring-blue-100", icon: "bg-blue-50 text-blue-600", glyph: "i" },
};

// Like Naive UI's `createDiscreteApi`, the entry point is a module-level object
// rather than a hook, so callers need no provider, no context and no dependency
// entries in their effects. <ToastProvider> only renders what is queued here.
type Emit = (toast: Omit<Toast, "id">) => void;
let emit: Emit | null = null;

function show(type: ToastType, title: string, content?: string, duration?: number): void {
  emit?.({ type, title, content, duration: duration ?? DEFAULT_DURATION[type] });
}

export const toast: ToastApi = {
  success: (title, content, duration) => show("success", title, content, duration),
  error: (title, content, duration) => show("error", title, content, duration),
  warning: (title, content, duration) => show("warning", title, content, duration),
  info: (title, content, duration) => show("info", title, content, duration),
};

/** Kept for parity with the Vue composable; returns the same singleton. */
export function useToast(): ToastApi {
  return toast;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const add = useCallback<Emit>(
    (incoming) => {
      const id = (nextId.current += 1);
      setToasts((current) => [...current, { ...incoming, id }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), incoming.duration),
      );
    },
    [dismiss],
  );

  useEffect(() => {
    emit = add;
    return () => {
      if (emit === add) emit = null;
    };
  }, [add]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, []);

  return (
    <>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col items-end gap-3 sm:inset-x-auto sm:right-6 sm:top-6 sm:w-96"
      >
        {toasts.map((item) => {
          const style = STYLE[item.type];
          return (
            <div
              key={item.id}
              role={item.type === "error" || item.type === "warning" ? "alert" : "status"}
              className={`toast-enter pointer-events-auto w-full rounded-2xl bg-white p-4 shadow-lg ring-1 ${style.ring}`}
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${style.icon}`}
                >
                  {style.glyph}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-6 text-slate-950">{item.title}</p>
                  {item.content && (
                    <p className="mt-1 text-sm leading-6 text-slate-600">{item.content}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(item.id)}
                  aria-label="Yopish"
                  className="-m-1 shrink-0 rounded-lg p-1 text-lg leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
