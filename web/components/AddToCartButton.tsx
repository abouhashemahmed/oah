// FILE: /web/components/AddToCartButton.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

type AddToCartButtonProps = {
  variantId: string;
  quantity?: number;
  redirectToCartOnSuccess?: boolean;
  className?: string;
  children?: React.ReactNode;
};

type ToastPayload = {
  type: "success" | "error";
  message: string;
};

// Helper to integrate with an existing toast system via a global event.
// You can hook this into your ToastNotifications component if you like.
function showToast(payload: ToastPayload) {
  if (typeof window === "undefined") return;

  try {
    window.dispatchEvent(
      new CustomEvent<ToastPayload>("app:toast", { detail: payload })
    );
  } catch {
    // Swallow errors so this never breaks the button.
  }
}

export default function AddToCartButton({
  variantId,
  quantity = 1,
  redirectToCartOnSuccess = false,
  className = "",
  children,
}: AddToCartButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClick = async () => {
    if (!variantId || isLoading) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          merchandiseId: variantId,
          quantity,
        }),
      });

      if (!res.ok) {
        let message = "Failed to add item to cart.";
        try {
          const data = await res.json();
          if (data?.error && typeof data.error === "string") {
            message = data.error;
          }
        } catch {
          // ignore JSON parse errors
        }
        showToast({ type: "error", message });
        return;
      }

      showToast({
        type: "success",
        message: "Item added to cart.",
      });

      if (redirectToCartOnSuccess) {
        router.push("/cart");
      } else {
        // Refresh any server components relying on cart data
        router.refresh();
      }
    } catch (err) {
      console.error("AddToCartButton error:", err);
      showToast({
        type: "error",
        message: "Something went wrong while adding to cart.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading || !variantId}
      className={[
        "inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm",
        "hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {isLoading ? "Adding..." : children ?? "Add to cart"}
    </button>
  );
}
