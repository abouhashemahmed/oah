/// FILE: /web/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

import { ToastProvider } from "@/components/ToastProvider";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Our Arab Heritage – Marketplace",
  description:
    "Discover handcrafted products from Arab artisans around the world.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-black text-white">
      <body className="min-h-screen bg-black text-white antialiased">
        <ToastProvider>
          <CartProvider>
            <Navbar />
            {/* Push content below fixed navbar */}
            <main className="pt-24">{children}</main>
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
