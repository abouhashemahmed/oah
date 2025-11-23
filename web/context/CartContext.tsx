// FILE: /web/context/CartContext.tsx
"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type Cart = any; // you can type this later to match your Shopify response

type CartContextValue = {
  cart: Cart | null;
  loading: boolean;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateLine: (lineId: string, quantity: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      if (!res.ok) {
        console.error("Failed to load cart", await res.text());
        setCart(null);
        return;
      }

      const data = await res.json();
      setCart(data ?? null);
    } catch (err) {
      console.error("refreshCart error:", err);
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load cart on first mount
    refreshCart();
  }, [refreshCart]);

  const addItem = useCallback(
    async (variantId: string, quantity = 1) => {
      setLoading(true);
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            merchandiseId: variantId,
            quantity,
          }),
        });

        if (!res.ok) {
          console.error("addItem failed:", await res.text());
          return;
        }

        const data = await res.json();
        setCart(data ?? null);
      } catch (err) {
        console.error("addItem error:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateLine = useCallback(
    async (lineId: string, quantity: number) => {
      setLoading(true);
      try {
        const res = await fetch("/api/cart/line", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ lineId, quantity }),
        });

        if (!res.ok) {
          console.error("updateLine failed:", await res.text());
          return;
        }

        const data = await res.json();
        setCart(data ?? null);
      } catch (err) {
        console.error("updateLine error:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const removeLine = useCallback(async (lineId: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart/line", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ lineIds: [lineId] }),
      });

      if (!res.ok) {
        console.error("removeLine failed:", await res.text());
        return;
      }

      const data = await res.json();
      setCart(data ?? null);
    } catch (err) {
      console.error("removeLine error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: CartContextValue = {
    cart,
    loading,
    addItem,
    updateLine,
    removeLine,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
