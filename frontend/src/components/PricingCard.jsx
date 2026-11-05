import { Link } from "react-router-dom";

export default function PricingCard({ plan, featured = false, onSelect }) {
  return (
    <div
      className={`relative flex flex-col rounded-3xl border p-7 transition duration-300 hover:-translate-y-1 ${
        featured
          ? "border-brand-500/35 bg-gradient-to-b from-white via-cream-50 to-cream-100 shadow-2xl shadow-brand-600/15"
          : "border-cream-200 bg-white hover:border-brand-400/40"
      }`}
    >
      {featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cream-50 shadow-lg shadow-brand-600/30">
          Most popular
        </span>
      )}

      <div>
        <h3 className="text-lg font-semibold text-ink">{plan.name}</h3>
        <p className="mt-1 text-sm text-muted">{plan.tagline}</p>
      </div>

      <div className="mt-6 flex items-end gap-1">
        <span className="text-4xl font-extrabold tracking-tight text-ink">
          {plan.price}
        </span>
        <span className="mb-1 text-sm text-muted">{plan.period}</span>
      </div>

      <ul className="mt-6 flex-1 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm">
            <svg
              viewBox="0 0 24 24"
              className="mt-0.5 h-4 w-4 shrink-0 text-brand-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <span className="text-brand-900/75">{feature}</span>
          </li>
        ))}
      </ul>

      {onSelect ? (
        <button
          type="button"
          onClick={() => onSelect(plan)}
          className={`mt-7 w-full ${
            featured ? "btn-primary" : "btn-ghost"
          }`}
        >
          {plan.cta}
        </button>
      ) : (
        <Link
          to={plan.ctaTo}
          className={`mt-7 w-full ${
            featured ? "btn-primary" : "btn-ghost"
          }`}
        >
          {plan.cta}
        </Link>
      )}
    </div>
  );
}
