// FILE: /web/app/profile/page.tsx
import Link from "next/link";

export default function ProfilePage() {
  // Later this can come from real user data
  const fakeUser = {
    name: "Guest",
    email: "you@example.com",
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-12 text-white">
      {/* Breadcrumbs */}
      <nav className="mb-6 text-sm text-white/60 flex items-center gap-2">
        <Link href="/" className="hover:text-white">
          Home
        </Link>
        <span>/</span>
        <span className="text-white">Profile</span>
      </nav>

      {/* Header */}
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Your Account
          </h1>
          <p className="text-white/70 text-sm sm:text-base">
            Manage your orders, settings, and marketplace activity.
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex gap-3">
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-md border border-white/20 px-4 py-2 text-sm font-medium hover:bg-white/10 transition"
          >
            Continue shopping
          </Link>
          <Link
            href="/for-sellers"
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition"
          >
            Become a seller
          </Link>
        </div>
      </header>

      {/* Top layout: user card + quick links */}
      <section className="grid gap-6 md:grid-cols-[2fr,1fr] mb-10">
        {/* User info card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600/30 border border-emerald-500/60 text-lg font-semibold">
              {fakeUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.15em] text-white/50">
                Signed in as
              </p>
              <p className="font-semibold">{fakeUser.name}</p>
              <p className="text-xs text-white/70">{fakeUser.email}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3 text-sm">
            <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
              <p className="text-white/60 mb-1">Orders</p>
              <p className="text-lg font-semibold">0</p>
              <p className="text-xs text-white/50 mt-1">
                No orders yet – your future collection starts here.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
              <p className="text-white/60 mb-1">Wishlist</p>
              <p className="text-lg font-semibold">Coming soon</p>
              <p className="text-xs text-white/50 mt-1">
                Save your favorite pieces across the Arab world.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
              <p className="text-white/60 mb-1">Seller status</p>
              <p className="text-lg font-semibold">Not a seller</p>
              <p className="text-xs text-white/50 mt-1">
                Apply to sell handcrafted items on Our Arab Heritage.
              </p>
            </div>
          </div>
        </div>

        {/* Quick nav */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-white/50 mb-3">
            Account navigation
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href="/profile/orders"
              className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-white/10 transition"
            >
              <span>Order history</span>
              <span className="text-xs text-white/50">View past orders</span>
            </Link>
            <Link
              href="/profile/settings"
              className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-white/10 transition"
            >
              <span>Account settings</span>
              <span className="text-xs text-white/50">
                Name, email, preferences
              </span>
            </Link>
            <Link
              href="/for-sellers"
              className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-white/10 transition"
            >
              <span>Seller info</span>
              <span className="text-xs text-white/50">
                Become a marketplace seller
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Lower section: cards for next features */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-900/40 via-black to-black p-6">
          <h2 className="text-lg font-semibold mb-2">
            Your future order history
          </h2>
          <p className="text-sm text-white/70 mb-4">
            Once you place an order, you’ll see delivery status, order
            summaries, and download receipts here.
          </p>
          <Link
            href="/profile/orders"
            className="inline-flex items-center text-sm font-medium text-emerald-300 hover:text-emerald-200"
          >
            View order history →
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold mb-2">
            Personalize your experience
          </h2>
          <p className="text-sm text-white/70 mb-4">
            Soon you’ll be able to set your favorite heritage, preferred
            categories, and communication preferences.
          </p>
          <Link
            href="/profile/settings"
            className="inline-flex items-center text-sm font-medium text-gray-200 hover:text-white"
          >
            Go to settings →
          </Link>
        </div>
      </section>
    </main>
  );
}
