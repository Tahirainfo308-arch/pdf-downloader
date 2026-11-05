import { Link } from "react-router-dom";

export default function Logo({ className = "", light = false }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-400 shadow-lg shadow-brand-600/25">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 text-cream-50"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M9 15h6" />
          <path d="M9 11h2" />
        </svg>
      </span>
      <span
        className={`text-lg font-bold tracking-tight ${
          light ? "text-cream-50" : "text-ink"
        }`}
      >
        PDF
        <span className={light ? "text-brand-300" : "text-brand-600"}>ly</span>
      </span>
    </Link>
  );
}
