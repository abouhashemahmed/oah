"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";

type AddToCartButtonProps = {
  variantId: string;
  quantity?: number;
  className?: string;
  children?: React.ReactNode;
};

export default function AddToCartButton({
  variantId,
  quantity = 1,
  className = "",
  children = "Add to Cart",
}: AddToCartButtonProps) {
  const router = useRouter();
  const notify = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClick = async () => {
    if (!variantId || isLoading) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchandiseId: variantId,
          quantity,
        }),
      });

      if (!res.ok) {
        let message = "Failed to add to cart.";
        try {
          const data = await res.json();
          if (data?.error && typeof data.error === "string") {
            message = data.error;
          }
        } catch {
          // ignore JSON parse issues
        }

        notify({ variant: "error", message });
        return;
      }

      notify({ variant: "success", message: "Added to cart." });

      // 🔑 Go to the cart so the user sees checkout button
      router.push("/cart");
      router.refresh();
    } catch (err) {
      console.error("AddToCart error:", err);
      notify({
        variant: "error",
        message: "Something went wrong while adding to the cart.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={[
        "inline-flex w-full items-center justify-center rounded-md",
        "bg-emerald-600 px-6 py-3 text-base font-semibold text-white",
        "hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60",
        "transition",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {isLoading ? "Adding..." : children}
    </button>
  );
}

