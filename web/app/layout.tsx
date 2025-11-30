// FILE: /web/app/layout.tsx
import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";

import Footer from "@/components/Footer";
import { ToastProvider } from "@/components/ToastProvider";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  // 🧠 Default title + template for subpages
  title: {
    default: "Our Arab Heritage – Marketplace",
    template: "%s | Our Arab Heritage",
  },
  description:
    "Discover handcrafted products from Palestinian and Arab artisans around the world.",
  keywords: [
    "Arab marketplace",
    "Palestinian products",
    "Middle Eastern art",
    "Arab artisans",
    "handcrafted decor",
    "Our Arab Heritage",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    // ✅ Must be a valid type for Next metadata
    type: "website",
    title: "Our Arab Heritage – Marketplace",
    description:
      "Discover handcrafted products from Palestinian and Arab artisans around the world.",
    url: "/",
    // If later you have a real hero image, put full URL here
    // images: [
    //   {
    //     url: "https://your-domain.com/og-image.jpg",
    //     width: 1200,
    //     height: 630,
    //     alt: "Our Arab Heritage – curated Arab marketplace",
    //   },
    // ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Arab Heritage – Marketplace",
    description:
      "Discover handcrafted products from Palestinian and Arab artisans around the world.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-black text-white">
      <body className="min-h-screen bg-black text-white antialiased flex flex-col">
        <ToastProvider>
          <CartProvider>
            {/* Page shell */}
            <div className="flex-1 flex flex-col">
              <Navbar />
              {/* Push content below fixed navbar */}
              <main className="pt-24">{children}</main>
            </div>

            {/* Global footer */}
            <Footer />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
