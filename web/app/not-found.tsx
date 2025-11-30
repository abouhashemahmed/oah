// FILE: /web/app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-white">
      <p className="text-xs tracking-[0.3em] uppercase text-white/40 mb-3">
        404
      </p>

      <h1 className="text-3xl md:text-4xl font-semibold mb-3 text-center">
        This page has wandered off the map.
      </h1>

      <p className="text-sm text-white/70 max-w-md text-center mb-6">
        Maybe it was a broken link, maybe the product was unpublished.  
        Let&apos;s bring you back to the gallery.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-white text-black px-5 py-2.5 text-sm font-semibold hover:bg-white/90"
        >
          Back to home
        </Link>

        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-md border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
        >
          Browse products
        </Link>
      </div>
    </main>
  );
}
