// FILE: /web/app/for-sellers/page.tsx
import Link from "next/link";

const SELLER_EMAIL = "abouhashemahmed2@gmail.com";

function mailtoHref(subject: string) {
  return `mailto:${SELLER_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

export default function ForSellersPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-16 text-white">
      {/* Breadcrumbs */}
      <nav className="mb-8 text-sm text-white/60 flex items-center gap-2">
        <Link href="/" className="hover:text-white">
          Home
        </Link>
        <span>/</span>
        <span className="text-white">For sellers</span>
      </nav>

      {/* Header */}
      <header className="mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          Sell with Our Arab Heritage
        </h1>
        <p className="text-lg text-white/80 max-w-3xl leading-relaxed">
          Our Arab Heritage is a curated marketplace for Palestinian and Arab
          makers, designers, and storytellers. If you create pieces that carry
          our region’s craft, history, or identity, we would love to hear from
          you.
        </p>
      </header>

      {/* How it works */}
      <section className="mb-12 space-y-4">
        <h2 className="text-2xl font-semibold mb-4">How it works</h2>
        <ol className="list-decimal list-inside space-y-3 text-white/85">
          <li>
            <span className="font-semibold">Introduce yourself.</span> Tell us
            who you are, where you’re based, and what you create.
          </li>
          <li>
            <span className="font-semibold">Share your work.</span> Send a few
            photos, links to Instagram / website, and typical price ranges.
          </li>
          <li>
            <span className="font-semibold">Curation & onboarding.</span> If
            it’s a fit, we’ll talk through details like product selection,
            fulfillment, and how we tell your story on the site.
          </li>
          <li>
            <span className="font-semibold">Launch.</span> Once everything is
            ready, we list your products and promote them across Our Arab
            Heritage.
          </li>
        </ol>
      </section>

      {/* What we’re looking for */}
      <section className="mb-12 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Who this is for</h2>
          <ul className="list-disc list-inside space-y-2 text-white/85">
            <li>Palestinian & Arab artisans, brands, and studios</li>
            <li>Handcrafted or small-batch products</li>
            <li>Artwork, prints, textiles, jewelry, ceramics, and more</li>
            <li>Creators who care about story, heritage, and quality</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">
            What makes a good fit
          </h2>
          <ul className="list-disc list-inside space-y-2 text-white/85">
            <li>Clear connection to an Arab country or diaspora story</li>
            <li>Strong photography or willingness to improve it</li>
            <li>Reliable way to ship orders on time</li>
            <li>Respectful, ethical representation of our cultures</li>
          </ul>
        </div>
      </section>

      {/* Simple “form” via email */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-4">Ready to apply?</h2>
        <p className="text-white/80 mb-4">
          Send us an email with the subject line{" "}
          <span className="font-semibold">
            “Apply to sell on Our Arab Heritage”
          </span>{" "}
          and include:
        </p>
        <ul className="list-disc list-inside space-y-2 text-white/85 mb-6">
          <li>Your name and where you’re based</li>
          <li>Your brand name (if you have one)</li>
          <li>Short description of what you make</li>
          <li>Links to Instagram, website, or portfolio</li>
          <li>3–5 sample product photos</li>
        </ul>

        <div className="flex flex-wrap gap-3">
          <a
            href={mailtoHref("Apply to sell on Our Arab Heritage")}
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition"
          >
            Email us your application
          </a>
          <a
            href={mailtoHref("Question about selling on Our Arab Heritage")}
            className="inline-flex items-center justify-center rounded-md border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
          >
            Ask a question
          </a>
        </div>

        <p className="mt-4 text-xs text-white/60">
          We review every message personally. Depending on interest, it may
          take us a little time to respond, but we do read every application.
        </p>
      </section>

      {/* Back link */}
      <div className="border-t border-white/10 pt-6 mt-4">
        <Link href="/" className="text-sm text-white/70 hover:text-white">
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
