import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Features from "../components/Features";
import Pricing from "../components/Pricing";
import { useAuth } from "../context/AuthContext";

const stats = [
  { value: "12k+", label: "PDFs generated" },
  { value: "3.2s", label: "Avg. conversion" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9/5", label: "User rating" },
];

export default function Home() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    const value = url.trim();
    if (!value) {
      setError("Paste a link to get started.");
      return;
    }
    setError("");
    const target = user ? "/dashboard" : "/signup";
    navigate(`${target}?url=${encodeURIComponent(value)}`);
  }

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(128,0,32,0.14),transparent_60%)]" />
      <div className="pointer-events-none absolute -left-32 top-96 -z-10 h-72 w-72 rounded-full bg-brand-400/10 blur-3xl" />

      <section className="mx-auto max-w-6xl px-5 pb-16 pt-20 text-center sm:pt-28">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-cream-300 bg-white/80 px-4 py-1.5 text-xs font-medium text-muted shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Powered by real Chromium rendering
          </span>

          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-6xl">
            Any web page.
            <span className="block bg-gradient-to-r from-brand-700 via-brand-500 to-brand-400 bg-clip-text text-transparent">
              One click. PDF.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base text-muted sm:text-lg">
            Paste a link and PDFly renders it into a clean, print-ready A4
            document — with images, fonts and backgrounds exactly as they appear
            online.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-9 max-w-2xl animate-fade-up"
        >
          <div className="flex flex-col gap-3 rounded-2xl border border-cream-300 bg-white p-2 shadow-2xl shadow-brand-600/10 sm:flex-row">
            <div className="flex flex-1 items-center gap-3 px-3">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 shrink-0 text-muted/60"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
                <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
              </svg>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full bg-transparent py-3 text-sm text-ink placeholder-muted/60 outline-none"
                aria-label="URL to convert"
              />
            </div>
            <button type="submit" className="btn-primary shrink-0">
              Convert to PDF
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
          <p className="mt-3 text-xs text-muted/70">
            Free plan includes 5 PDFs. No credit card required.
          </p>
        </form>

        <div className="mx-auto mt-16 max-w-4xl animate-fade-up">
          <div className="overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-2xl shadow-brand-900/10">
            <div className="flex items-center gap-2 border-b border-cream-200 bg-cream-100 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-brand-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
              <div className="ml-3 flex-1 rounded-md bg-white px-3 py-1 text-left text-[11px] text-muted/70">
                pdfly.app/dashboard
              </div>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-[1.4fr_1fr]">
              <div className="rounded-xl border border-cream-200 bg-cream-50 p-5 text-left">
                <p className="text-[11px] uppercase tracking-wider text-brand-700/60">
                  Convert a link
                </p>
                <div className="mt-3 rounded-lg border border-cream-300 bg-white px-3 py-2.5 text-xs text-muted">
                  https://en.wikipedia.org/wiki/PDF
                </div>
                <button className="btn-primary mt-3 w-full !py-2.5">
                  Generating PDF…
                </button>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-cream-200">
                  <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-brand-600 to-brand-400" />
                </div>
              </div>
              <div className="rounded-xl border border-cream-200 bg-cream-50 p-5 text-left">
                <p className="text-[11px] uppercase tracking-wider text-brand-700/60">
                  Recent files
                </p>
                <div className="mt-3 space-y-2.5">
                  {["wikipedia-org.pdf", "docs-python-org.pdf", "news-site.pdf"].map(
                    (file, i) => (
                      <div
                        key={file}
                        className="flex items-center gap-2.5 rounded-lg border border-cream-200 bg-white p-2.5"
                      >
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-brand-600/10 text-[9px] font-bold text-brand-700">
                          PDF
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] text-ink">
                            {file}
                          </p>
                          <p className="text-[10px] text-muted/70">
                            {i + 1} day ago
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="card !p-4">
              <p className="text-xl font-bold text-ink">{stat.value}</p>
              <p className="mt-1 text-[11px] uppercase tracking-wider text-muted/70">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Features />
      <Pricing />

      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-brand-700 bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 px-6 py-14 text-center shadow-2xl shadow-brand-900/25">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-400/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-cream-100/10 blur-3xl" />
          <h2 className="text-2xl font-bold text-cream-50 sm:text-3xl">
            Your next document is one link away
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-cream-100/80">
            Join thousands of people turning articles, invoices and docs into
            PDFs without fiddling with print dialogs.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to={user ? "/dashboard" : "/signup"}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cream-50 px-5 py-3 text-sm font-semibold text-brand-700 shadow-lg shadow-brand-900/25 transition hover:bg-cream-100"
            >
              {user ? "Open dashboard" : "Create free account"}
            </Link>
            <a
              href="#pricing"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-cream-200/30 bg-transparent px-5 py-3 text-sm font-semibold text-cream-50 transition hover:bg-cream-50/10"
            >
              Compare plans
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
