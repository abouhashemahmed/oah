// FILE: /web/components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-black/90">
      <div className="max-w-6xl mx-auto px-6 py-8 text-sm text-white/70 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="font-semibold text-white">Our Arab Heritage</p>
          <p className="text-xs text-white/50 mt-1">
            A curated marketplace celebrating Palestinian and Arab artisans,
            stories, and culture.
          </p>
        </div>

        <nav className="flex flex-wrap gap-4 text-xs md:text-sm">
          <Link href="/" className="hover:text-white transition">
            Home
          </Link>
          <Link href="/products" className="hover:text-white transition">
            Products
          </Link>
          <Link href="/about" className="hover:text-white transition">
            About
          </Link>
          <Link href="/contact" className="hover:text-white transition">
            Contact
          </Link>
          <Link href="/for-sellers" className="hover:text-white transition">
            For sellers
          </Link>
        </nav>

        <p className="text-xs text-white/40">
          © {new Date().getFullYear()} Our Arab Heritage. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
