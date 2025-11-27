// FILE: /web/app/contact/page.tsx
import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12 text-white">
      <nav className="mb-6 text-sm text-white/60 flex items-center gap-2">
        <Link href="/" className="hover:text-white">
          Home
        </Link>
        <span>/</span>
        <span className="text-white">Contact</span>
      </nav>

      <h1 className="text-4xl font-bold mb-4">Contact</h1>

      <p className="text-lg text-white/80 mb-6 leading-relaxed">
        Have a question about an order, a product, or selling on Our Arab
        Heritage? Reach out and we&apos;ll get back to you as soon as we can.
      </p>

      <div className="space-y-4 mb-8 text-white/80">
        <p>
          <span className="font-semibold text-white">Email:</span>{" "}
          <a
            href="mailto:hello@ourarabheritage.com"
            className="underline hover:text-indigo-300"
          >
            hello@ourarabheritage.com
          </a>
        </p>
        <p className="text-sm text-white/60">
          (You can change this email later to whatever address you prefer.)
        </p>
      </div>

      {/* Placeholder form for the future */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
        <p className="text-sm text-white/70 mb-2">
          Coming soon: a simple contact form so visitors can message you
          directly from the site.
        </p>
      </div>
    </main>
  );
}
