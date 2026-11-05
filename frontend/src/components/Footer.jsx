import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-brand-900/5 bg-cream-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Logo />
          <p className="max-w-xs text-sm text-muted">
            Any web page. One click. A clean, print-ready PDF.
          </p>
        </div>

        <div className="flex flex-wrap gap-6 text-sm text-brand-700/80">
          <a href="#features" className="transition hover:text-brand-600">
            Features
          </a>
          <a href="#pricing" className="transition hover:text-brand-600">
            Pricing
          </a>
          <Link to="/login" className="transition hover:text-brand-600">
            Log in
          </Link>
          <Link to="/signup" className="transition hover:text-brand-600">
            Sign up
          </Link>
        </div>
      </div>
      <div className="border-t border-brand-900/5 py-5 text-center text-xs text-muted/80">
        © {new Date().getFullYear()} PDFly. Built with FastAPI, Playwright &
        React.
      </div>
    </footer>
  );
}
