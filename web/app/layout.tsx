// FILE: /web/app/layout.tsx
import type { ReactNode } from "react";
import "./globals.css";
import type { Metadata } from "next";
import Footer from "@/components/Footer";

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
  children: ReactNode;
}) {
  return (
    <html lang="en" className="bg-black text-white">
      <body className="min-h-screen bg-black text-white antialiased flex flex-col">
        <ToastProvider>
          <CartProvider>
            {/* Page shell */}
            <div className="flex-1 flex flex-col">
              <Navbar />
              {/* Push content below fixed navbar */}
              <main className="pt-24">
                {children}
              </main>
            </div>

            {/* Global footer */}
            <Footer />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

