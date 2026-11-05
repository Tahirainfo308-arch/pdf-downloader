import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const onHome = location.pathname === "/";

  function handleLogout() {
    logout();
    setOpen(false);
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-brand-900/5 bg-cream-50/90 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Logo />

        <div className="hidden items-center gap-8 md:flex">
          {onHome ? (
            <>
              <a
                href="#features"
                className="text-sm font-medium text-muted transition hover:text-brand-700"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-sm font-medium text-muted transition hover:text-brand-700"
              >
                Pricing
              </a>
            </>
          ) : (
            <Link
              to="/"
              className="text-sm font-medium text-muted transition hover:text-brand-700"
            >
              Home
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="text-sm font-medium text-brand-700 transition hover:text-brand-600"
              >
                Dashboard
              </Link>
              <button onClick={handleLogout} className="btn-ghost !py-2 !px-4">
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-brand-700 transition hover:text-brand-600"
              >
                Log in
              </Link>
              <Link to="/signup" className="btn-primary !py-2 !px-4">
                Start free
              </Link>
            </div>
          )}
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-lg border border-cream-300 bg-white text-brand-700 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-cream-200 bg-cream-50 px-5 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {onHome && (
              <>
                <a
                  href="#features"
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-brand-700"
                >
                  Features
                </a>
                <a
                  href="#pricing"
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-brand-700"
                >
                  Pricing
                </a>
              </>
            )}
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-brand-700"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-ghost !py-2 text-left"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-brand-700"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setOpen(false)}
                  className="btn-primary !py-2"
                >
                  Start free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
