// FILE: /web/components/Navbar.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import NavbarCartIcon from "./NavbarCartIcon";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full bg-black/80 backdrop-blur-md border-b border-white/10 fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo + beta pill */}
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-bold tracking-wide text-white"
        >
          <span>Our Arab Heritage</span>
          <span className="text-[10px] uppercase tracking-[0.18em] rounded-full border border-white/30 bg-white/10 px-2 py-0.5 text-white/80">
            Beta
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-white">
          <Link href="/products" className="hover:text-gray-300">
            Products
          </Link>
          <Link href="/for-sellers" className="hover:text-gray-300">
            For sellers
          </Link>
          <Link href="/about" className="hover:text-gray-300">
            About
          </Link>
          <NavbarCartIcon />
        </nav>

        {/* Mobile Button */}
        <button
          className="md:hidden text-white text-3xl"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-black/95 border-t border-white/10 px-6 py-4 flex flex-col gap-4 text-sm">
          <Link
            href="/products"
            className="text-white hover:text-gray-300"
            onClick={() => setOpen(false)}
          >
            Products
          </Link>
          <Link
            href="/for-sellers"
            className="text-white hover:text-gray-300"
            onClick={() => setOpen(false)}
          >
            For sellers
          </Link>
          <Link
            href="/about"
            className="text-white hover:text-gray-300"
            onClick={() => setOpen(false)}
          >
            About
          </Link>

          <NavbarCartIcon />
        </div>
      )}
    </header>
  );
}
