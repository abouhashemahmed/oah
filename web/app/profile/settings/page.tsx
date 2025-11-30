// FILE: /web/app/profile/settings/page.tsx
import Link from "next/link";

export default function SettingsPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12 text-white">
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
        <span className="text-white">Settings</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Account settings</h1>
        <p className="text-sm text-white/70">
          Update your basic info and prepare for future features like saved
          addresses and preferences.
        </p>
      </header>

      <section className="space-y-8">
        {/* Basic info card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold mb-1">Basic information</h2>
          <p className="text-xs text-white/60 mb-4">
            For now this section is visual only. Later we’ll connect it to real
            authentication and profile data.
          </p>

          {/* ✅ No onSubmit handler here – pure server component markup */}
          <form className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <label className="block text-xs text-white/60 mb-1">
                Full name
              </label>
              <input
                disabled
                type="text"
                placeholder="Your name"
                className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500/70"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-xs text-white/60 mb-1">
                Email address
              </label>
              <input
                disabled
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500/70"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs text-white/60 mb-1">
                Preferred heritage (coming soon)
              </label>
              <select
                disabled
                className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/70"
              >
                <option>Palestinian</option>
                <option>Egyptian</option>
                <option>Syrian</option>
                <option>Lebanese</option>
                <option>Jordanian</option>
                <option>Moroccan</option>
                <option>Iraqi</option>
                <option>Emirati</option>
                <option>Saudi</option>
                <option>Tunisian</option>
                <option>Algerian</option>
                <option>Yemeni</option>
              </select>
              <p className="mt-1 text-[11px] text-white/50">
                Later we’ll use this to highlight products from your preferred
                heritage across the marketplace.
              </p>
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center rounded-md bg-white/10 px-4 py-2 text-xs font-medium text-white border border-white/20 cursor-not-allowed opacity-50"
              >
                Save changes (soon)
              </button>
            </div>
          </form>
        </div>

        {/* Security / notifications placeholder */}
        <div className="rounded-2xl border border-dashed border-white/20 bg-black/40 p-6">
          <h2 className="text-lg font-semibold mb-2">
            Security & notifications
          </h2>
          <p className="text-sm text-white/70 mb-2">
            In a future phase, you’ll manage login methods, password updates,
            and notifications here.
          </p>
          <p className="text-xs text-white/50">
            For now, this area is a visual placeholder so your account section
            feels complete and ready for real users.
          </p>
        </div>
      </section>
    </main>
  );
}
