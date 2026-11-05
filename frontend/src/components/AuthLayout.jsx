import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl items-center gap-10 px-5 py-12 lg:grid-cols-2">
      <div className="hidden lg:block">
        <div className="relative overflow-hidden rounded-3xl border border-brand-700/40 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-10 shadow-2xl shadow-brand-900/20">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-400/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-cream-100/10 blur-3xl" />

          <Logo light />

          <h2 className="mt-14 max-w-sm text-3xl font-bold leading-tight text-cream-50">
            The fastest way to keep the web, offline.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream-100/80">
            Save articles, invoices, docs and dashboards as beautiful PDFs.
            Rendered in a real browser, downloaded in seconds.
          </p>

          <div className="mt-12 space-y-4">
            {[
              "5 free PDFs to start — no card",
              "Real Chromium rendering",
              "Your history, saved to your account",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 text-sm text-cream-100"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cream-50/15 text-cream-50">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md">
        <div className="lg:hidden">
          <Logo />
        </div>
        <div className="mt-8 lg:mt-0">
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-muted">{subtitle}</p>

          <div className="mt-8">{children}</div>

          <p className="mt-6 text-center text-sm text-muted">{footer}</p>

          <p className="mt-8 text-center text-xs text-muted/70">
            By continuing you agree to our{" "}
            <Link to="/" className="text-brand-600 hover:text-brand-700">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/" className="text-brand-600 hover:text-brand-700">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
