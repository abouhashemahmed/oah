// FILE: /web/app/profile/orders/page.tsx
import Link from "next/link";

export default function OrdersPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-12 text-white">
      {/* Breadcrumbs */}
      <nav className="mb-6 text-sm text-white/60 flex items-center gap-2">
        <Link href="/" className="hover:text-white">
          Home
        </Link>
        <span>/</span>
        <Link href="/profile" className="hover:text-white">
          Profile
        </Link>
        <span>/</span>
        <span className="text-white">Orders</span>
      </nav>

      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Order history</h1>
        <p className="text-sm text-white/70">
          Track your past purchases and download receipts.
        </p>
      </header>

      {/* Empty state for now */}
      <section className="rounded-2xl border border-dashed border-white/20 bg-black/40 p-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5 border border-white/20">
          {/* Simple receipt icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-white/60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 7h6M9 11h6m-9 8 2-2 2 2 2-2 2 2 2-2"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-2">
          No orders in your history yet
        </h2>
        <p className="text-sm text-white/70 mb-6 max-w-md">
          When you purchase handcrafted pieces, they’ll appear here with order
          status, delivery details, and downloadable receipts.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition"
        >
          Start your first order
        </Link>
      </section>
    </main>
  );
}
