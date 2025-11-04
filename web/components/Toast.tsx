"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

type Toast = { id: string; title?: string; message: string; variant?: "success" | "error" | "info" };
type ToastContextValue = {
  notify: (t: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const notify = useCallback((t: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, ...t }]);
    // auto-dismiss after 2.5s
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 2500);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx.notify;
}

function ToastViewport({ toasts }: { toasts: Toast[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={[
            "min-w-[240px] max-w-[360px] rounded-xl border px-4 py-3 shadow-lg backdrop-blur",
            t.variant === "success" && "bg-emerald-600/10 border-emerald-800 text-emerald-100",
            t.variant === "error" && "bg-red-600/10 border-red-800 text-red-100",
            (!t.variant || t.variant === "info") && "bg-zinc-800/80 border-zinc-700 text-white",
          ].join(" ")}
          role="status"
          aria-live="polite"
        >
          {t.title ? <div className="font-semibold mb-0.5">{t.title}</div> : null}
          <div className="text-sm">{t.message}</div>
        </div>
      ))}
    </div>,
    document.body
  );
}

