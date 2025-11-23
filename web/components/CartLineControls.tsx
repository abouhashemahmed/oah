// FILE: /web/components/CartLineControls.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

type CartLineControlsProps = {
  lineId: string;
  quantity: number;
};

export default function CartLineControls({
  lineId,
  quantity,
}: CartLineControlsProps) {
  const router = useRouter();
  const { updateLine, removeLine, loading } = useCart();
  const [localQty, setLocalQty] = useState(quantity);
  const [pending, setPending] = useState(false);

  const disabled = loading || pending;

  async function handleChange(nextQty: number) {
    if (nextQty < 1) return;

    setLocalQty(nextQty);
    setPending(true);
    try {
      await updateLine(lineId, nextQty);
      // Refresh the cart page so totals + prices stay in sync with Shopify
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function handleRemove() {
    setPending(true);
    try {
      await removeLine(lineId);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="inline-flex items-center border border-white/20 rounded-md overflow-hidden">
        <button
          type="button"
          onClick={() => handleChange(localQty - 1)}
          disabled={disabled}
          className="px-3 py-1 text-lg disabled:opacity-40"
        >
          –
        </button>
        <span className="px-4 py-1 min-w-[2.5rem] text-center">
          {localQty}
        </span>
        <button
          type="button"
          onClick={() => handleChange(localQty + 1)}
          disabled={disabled}
          className="px-3 py-1 text-lg disabled:opacity-40"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={handleRemove}
        disabled={disabled}
        className="text-sm text-red-400 hover:text-red-300 disabled:opacity-40"
      >
        Remove
      </button>
    </div>
  );
}
