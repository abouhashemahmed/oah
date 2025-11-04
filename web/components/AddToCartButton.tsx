"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function AddToCartButton({
  variantId,
  quantity = 1,
  label = "Add to cart",
  redirectToCart = true,
}: {
  variantId: string;
  quantity?: number;
  label?: string;
  redirectToCart?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variantId, quantity }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.detail || j?.error || res.statusText);
        }
        if (redirectToCart) router.push("/cart");
      } catch (e: any) {
        setError(e?.message || "Failed to add to cart");
      }
    });
  }

  return (
    <div className="space-y-2">
      <button
        disabled={pending}
        onClick={handleClick}
        className="inline-flex items-center rounded-lg bg-indigo-600 px-5 py-2.5 text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {pending ? "Adding…" : label}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

