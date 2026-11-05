const features = [
  {
    title: "Pixel-perfect rendering",
    description:
      "Playwright drives a real Chromium browser, so fonts, images and layouts look exactly like the live page.",
    icon: (
      <path d="M12 3l9 4.5-9 4.5-9-4.5L12 3zm9 9l-9 4.5L3 12m18 4.5L12 21l-9-4.5" />
    ),
  },
  {
    title: "One-click downloads",
    description:
      "Paste a link, hit convert and the PDF lands in your downloads folder. No plugins, no setup.",
    icon: (
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" />
    ),
  },
  {
    title: "Full-page captures",
    description:
      "Long articles, docs and landing pages are captured end to end with backgrounds and margins preserved.",
    icon: (
      <path d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm2 4h6M9 11h6M9 15h4" />
    ),
  },
  {
    title: "Private by default",
    description:
      "Links are validated, internal hosts are blocked and your conversion history belongs to your account only.",
    icon: (
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3zm-2 9l2 2 4-4" />
    ),
  },
  {
    title: "Built for teams",
    description:
      "Track usage per account and upgrade only when you need more conversions. No hidden fees.",
    icon: (
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    ),
  },
  {
    title: "Blazing fast API",
    description:
      "FastAPI + async Playwright keep conversions quick, with clean JSON errors your frontend can render.",
    icon: (
      <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
    ),
  },
];

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-5 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-600">
          Features
        </p>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Everything you need to turn pages into PDFs
        </h2>
        <p className="mt-4 text-muted">
          A focused toolkit for capturing the web — designed for researchers,
          freelancers and teams who live in documents.
        </p>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="group card transition duration-300 hover:-translate-y-1 hover:border-brand-400/40"
          >
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-brand-600/10 text-brand-600 ring-1 ring-inset ring-brand-600/15 transition group-hover:bg-brand-600/15">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {feature.icon}
              </svg>
            </div>
            <h3 className="text-base font-semibold text-ink">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
