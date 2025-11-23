"use client";

import Link from "next/link";
import { useState } from "react";
import NavbarCartIcon from "./NavbarCartIcon";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full bg-black/80 backdrop-blur-md border-b border-white/10 fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-wide text-white">
          Our Arab Heritage
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-white">
          <Link href="/products" className="hover:text-gray-300">
            Products
          </Link>
          <NavbarCartIcon />
        </nav>

        {/* Mobile Button */}
        <button
          className="md:hidden text-white text-3xl"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-black/95 border-t border-white/10 px-6 py-4 flex flex-col gap-4">
          <Link href="/products" className="text-white hover:text-gray-300">
            Products
          </Link>

          <NavbarCartIcon />
        </div>
      )}
    </header>
  );
}
