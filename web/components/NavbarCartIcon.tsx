// FILE: /web/components/NavbarCartIcon.tsx
"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import CartDrawer from "./CartDrawer";

export default function NavbarCartIcon() {
  const { cart, loading } = useCart();
  const [open, setOpen] = useState(false);

  const qty = cart?.totalQuantity ?? 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 transition"
        aria-label="Open cart"
      >
        {/* Shopping cart icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="w-6 h-6"
          viewBox="0 0 24 24"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h3l3.6 7.59a2 2 0 0 0 1.75 1.41H19a2 2 0 0 0 1.93-1.54L23 6H6" />
        </svg>

        {/* Quantity bubble */}
        {!loading && qty > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-semibold rounded-full px-2 py-0.5">
            {qty}
          </span>
        )}
      </button>

      {/* Slide-out drawer */}
      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
