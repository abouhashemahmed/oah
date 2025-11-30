// FILE: /web/components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-white/10 bg-black/90 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        {/* Left: brand + tagline */}
        <div className="space-y-2">
          <p className="text-sm font-semibold">
            Our Arab Heritage
          </p>
          <p className="text-xs text-white/60 max-w-md">
            A curated marketplace for Arab artisans, stories, and handcrafted
            pieces from across the region and diaspora.
          </p>
          <p className="text-[11px] text-white/40">
            This site is in active beta. Product availability, pricing, and
            shipping details may change as we grow.
          </p>
        </div>

        {/* Right: links */}
        <div className="flex flex-col items-start gap-3 text-xs md:items-end">
          <nav className="flex flex-wrap gap-4 md:justify-end">
            <Link href="/about" className="hover:text-white/80">
              About
            </Link>
            <Link href="/for-sellers" className="hover:text-white/80">
              For sellers
            </Link>
            <Link href="/privacy" className="hover:text-white/80">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white/80">
              Terms
            </Link>
            <Link href="/shipping-returns" className="hover:text-white/80">
              Shipping &amp; returns
            </Link>
          </nav>

          <p className="text-[11px] text-white/50">
            © {year} Our Arab Heritage. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
