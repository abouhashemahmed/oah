// FILE: /web/components/SellerInterestForm.tsx
"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export default function SellerInterestForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Convert to plain object so we can send JSON
    const body = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/seller-interest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          (data && typeof data.error === "string" && data.error) ||
          "Something went wrong while sending your message.";
        throw new Error(msg);
      }

      // Success 🎉
      setStatus("success");
      form.reset();
    } catch (err: any) {
      console.error("[seller-interest] client error:", err);
      setStatus("error");
      setErrorMessage(err?.message || "Failed to send. Please try again.");
    } finally {
      // stay in success / error state, but leave "submitting"
      if (status === "submitting") {
        setStatus("idle");
      }
    }
  }

  const isSubmitting = status === "submitting";

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit}
        method="post"
        className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-5 text-sm"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-xs font-medium text-white/80">
              Your name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="px-3 py-2 rounded-md bg-black/40 border border-white/15 text-white text-sm"
              placeholder="e.g. Lina Abu Hasan"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="email"
              className="text-xs font-medium text-white/80"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="px-3 py-2 rounded-md bg-black/40 border border-white/15 text-white text-sm"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="instagram"
              className="text-xs font-medium text-white/80"
            >
              Instagram / website (optional)
            </label>
            <input
              id="instagram"
              name="instagram"
              type="text"
              className="px-3 py-2 rounded-md bg-black/40 border border-white/15 text-white text-sm"
              placeholder="@yourbrand or https://"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="country"
              className="text-xs font-medium text-white/80"
            >
              Where are you based?
            </label>
            <input
              id="country"
              name="country"
              type="text"
              className="px-3 py-2 rounded-md bg-black/40 border border-white/15 text-white text-sm"
              placeholder="City, country"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="heritage"
            className="text-xs font-medium text-white/80"
          >
            Heritage / region you identify with
          </label>
          <input
            id="heritage"
            name="heritage"
            type="text"
            className="px-3 py-2 rounded-md bg-black/40 border border-white/15 text-white text-sm"
            placeholder="e.g. Palestinian, Moroccan, Iraqi, etc."
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="category"
            className="text-xs font-medium text-white/80"
          >
            What do you sell?
          </label>
          <textarea
            id="category"
            name="category"
            rows={3}
            className="px-3 py-2 rounded-md bg-black/40 border border-white/15 text-white text-sm resize-none"
            placeholder="e.g. handwoven textiles, ceramics, calligraphy prints, jewelry…"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="notes" className="text-xs font-medium text-white/80">
            Anything else you&apos;d like us to know?
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="px-3 py-2 rounded-md bg-black/40 border border-white/15 text-white text-sm resize-none"
            placeholder="Tell us your story, how long you’ve been creating, or any questions you have."
          />
        </div>

        <p className="text-[11px] text-white/50">
          This form is for early interest only. Submitting does not guarantee
          approval, but it helps us understand who to invite as we grow.
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-semibold text-white transition"
        >
          {isSubmitting ? "Submitting…" : "Submit interest (beta)"}
        </button>
      </form>

      {/* Status messages */}
      {status === "success" && (
        <p
          className="text-sm text-emerald-400"
          aria-live="polite"
        >
          Thank you! Your details were sent. We&apos;ll reach out as we open new
          seller spots.
        </p>
      )}

      {status === "error" && (
        <p
          className="text-sm text-red-400"
          aria-live="polite"
        >
          {errorMessage ||
            "Something went wrong sending your interest. Please try again in a moment."}
        </p>
      )}
    </div>
  );
}
