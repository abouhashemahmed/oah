"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useToast } from "./Toast";

// Accessible live region utility (announces updates for screen readers)
function LiveRegion() {
  const ref = useRef<HTMLDivElement>(null);
  return <div ref={ref} aria-live="polite" aria-atomic="true" className="sr-only" />;
}

type Props = {
  lineId: string;
  quantity: number;
  onChanged?: (qty: number) => void; // optional callback if parent wants to react without reload
};

export default function CartLineControls({ lineId, quantity, onChanged }: Props) {
  const notify = useToast();
  const [qty, setQty] = useState<number>(quantity);
  const [isPending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false); // visual disable state to cover network lag
  const lastStableQty = useRef<number>(quantity);

  // keep local qty in sync if parent re-renders with new quantity
  useEffect(() => {
    setQty(quantity);
    lastStableQty.current = quantity;
  }, [quantity]);

  const updateServer = async (newQty: number) => {
    try {
      setBusy(true);
      const res = await fetch("/api/cart/line", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lineId, quantity: newQty }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Update failed");
      }
      lastStableQty.current = newQty;
      notify({ variant: "success", message: `Updated to quantity ${newQty}` });
      onChanged?.(newQty);
    } catch (e: any) {
      // revert optimistic qty
      setQty(lastStableQty.current);
      notify({ variant: "error", message: "Could not update quantity. Please try again." });
      console.error("cart update error:", e?.message || e);
    } finally {
      setBusy(false);
    }
  };

  const removeServer = async () => {
    try {
      setBusy(true);
      const res = await fetch("/api/cart/line", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lineId }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Remove failed");
      }
      notify({ variant: "success", message: "Item removed from cart." });
      // simplest refresh so totals/lines update
      startTransition(() => {
        window.location.reload();
      });
    } catch (e: any) {
      notify({ variant: "error", message: "Could not remove item. Please try again." });
      console.error("cart remove error:", e?.message || e);
    } finally {
      setBusy(false);
    }
  };

  const dec = () => {
    if (busy || isPending) return;
    if (qty <= 1) return; // don’t go below 1 (use Remove instead)
    const next = qty - 1;
    setQty(next); // optimistic
    updateServer(next);
  };

  const inc = () => {
    if (busy || isPending) return;
    const next = qty + 1;
    setQty(next); // optimistic
    updateServer(next);
  };

  const remove = () => {
    if (busy || isPending) return;
    removeServer();
  };

  return (
    <div className="flex items-center gap-3 mt-2">
      <LiveRegion />
      <button
        type="button"
        disabled={busy || isPending || qty <= 1}
        onClick={dec}
        className="px-2 py-1 border border-zinc-700 rounded hover:bg-zinc-800 disabled:opacity-50"
        aria-label="Decrease quantity"
      >
        –
      </button>
      <span aria-label="Quantity" className="min-w-6 text-center">{qty}</span>
      <button
        type="button"
        disabled={busy || isPending}
        onClick={inc}
        className="px-2 py-1 border border-zinc-700 rounded hover:bg-zinc-800 disabled:opacity-50"
        aria-label="Increase quantity"
      >
        +
      </button>

      <button
        type="button"
        disabled={busy || isPending}
        onClick={remove}
        className="text-red-500 hover:underline text-sm ml-2 disabled:opacity-50"
        aria-label="Remove item"
      >
        Remove
      </button>
    </div>
  );
}
