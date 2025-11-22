// FILE: /web/components/CartLineControls.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

type CartLineControlsProps = {
  lineId: string;
  quantity: number;
  className?: string;
};

type ToastPayload = {
  type: "success" | "error";
  message: string;
};

function showToast(payload: ToastPayload) {
  if (typeof window === "undefined") return;

  try {
    window.dispatchEvent(
      new CustomEvent<ToastPayload>("app:toast", { detail: payload })
    );
  } catch {
    // Ignore errors to keep controls robust
  }
}

export default function CartLineControls({
  lineId,
  quantity,
  className = "",
}: CartLineControlsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;

  const updateQuantity = async (nextQuantity: number) => {
    if (!lineId) return;
    if (nextQuantity < 1) return; // keep in sync with API validation
    if (isLoading) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/cart/line", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lineId,
          quantity: nextQuantity,
        }),
      });

      if (!res.ok) {
        let message = "Failed to update quantity.";
        try {
          const data = await res.json();
          if (data?.error && typeof data.error === "string") {
            message = data.error;
          }
        } catch {
          // ignore
        }

        showToast({ type: "error", message });
        return;
      }

      showToast({
        type: "success",
        message: "Cart updated.",
      });

      router.refresh();
    } catch (err) {
      console.error("CartLineControls update error:", err);
      showToast({
        type: "error",
        message: "Something went wrong while updating the cart.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeLine = async () => {
    if (!lineId || isLoading) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/cart/line", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lineIds: [lineId],
        }),
      });

      if (!res.ok) {
        let message = "Failed to remove item.";
        try {
          const data = await res.json();
          if (data?.error && typeof data.error === "string") {
            message = data.error;
          }
        } catch {
          // ignore
        }

        showToast({ type: "error", message });
        return;
      }

      showToast({
        type: "success",
        message: "Item removed from cart.",
      });

      router.refresh();
    } catch (err) {
      console.error("CartLineControls remove error:", err);
      showToast({
        type: "error",
        message: "Something went wrong while removing the item.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecrement = () => updateQuantity(safeQuantity - 1);
  const handleIncrement = () => updateQuantity(safeQuantity + 1);

  return (
    <div
      className={[
        "inline-flex items-center gap-2 text-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="inline-flex items-center rounded-md border border-gray-300 bg-white shadow-sm">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={isLoading || safeQuantity <= 1}
          className="px-2 py-1 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="px-3 py-1 min-w-[2rem] text-center text-gray-900">
          {safeQuantity}
        </span>
        <button
          type="button"
          onClick={handleIncrement}
          disabled={isLoading}
          className="px-2 py-1 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={removeLine}
        disabled={isLoading}
        className="text-xs font-medium text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Remove
      </button>
    </div>
  );
}
