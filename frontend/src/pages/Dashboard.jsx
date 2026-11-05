import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  convertToPdf,
  downloadBlob,
  fetchHistory,
  getErrorMessage,
} from "../api";
import MockCheckout from "../components/MockCheckout";
import { useAuth } from "../context/AuthContext";

const FREE_LIMIT = 5;

function filenameFor(rawUrl) {
  try {
    const host = new URL(
      rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`
    ).hostname;
    return `${host.replace(/\./g, "-") || "page"}.pdf`;
  } catch {
    return "page.pdf";
  }
}

async function extractError(error) {
  const data = error?.response?.data;
  if (data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text());
      if (typeof parsed.detail === "string") return parsed.detail;
    } catch {
      /* fall through */
    }
    return "Could not create a PDF for this link.";
  }
  return getErrorMessage(error, "Could not create a PDF for this link.");
}

export default function Dashboard() {
  const { user, updateUser, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [url, setUrl] = useState(searchParams.get("url") || "");
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [cleanMode, setCleanMode] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const isFree = (user?.plan || "free") === "free";
  const used = user?.pdf_count ?? 0;
  const remaining = Math.max(0, FREE_LIMIT - used);
  const percent = Math.min(100, Math.round((used / FREE_LIMIT) * 100));
  const limitReached = isFree && used >= FREE_LIMIT;

  const loadHistory = useCallback(async () => {
    try {
      const data = await fetchHistory();
      setHistory(data);
    } catch {
      /* history is non-critical */
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const initials = useMemo(
    () =>
      (user?.name || "U")
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    [user?.name]
  );

  async function handleConvert(event) {
    event.preventDefault();
    const value = url.trim();
    if (!value) {
      setError("Paste a link to convert.");
      return;
    }

    setError("");
    setSuccess("");
    setConverting(true);

    try {
      const { blob, count } = await convertToPdf(value, { clean: cleanMode });
      downloadBlob(blob, filenameFor(value));
      setSuccess("Your PDF is ready and downloading now.");
      const nextCount = count ?? used + 1;
      updateUser({ pdf_count: nextCount });
      setUrl("");
      loadHistory();
    } catch (err) {
      if (err?.response?.status === 401) {
        logout();
        return;
      }
      setError(await extractError(err));
    } finally {
      setConverting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-400 text-sm font-bold text-cream-50 shadow-lg shadow-brand-600/25">
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink sm:text-2xl">
              Hi {user?.name?.split(" ")[0] || "there"} 👋
            </h1>
            <p className="text-sm text-muted">
              Paste a link below and we&apos;ll render it into a PDF.
            </p>
          </div>
        </div>

        <span className="rounded-full border border-brand-600/20 bg-brand-600/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700">
          {isFree ? "Free plan" : `${user?.plan} plan`}
        </span>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <section className="card !p-6 sm:!p-8">
            <h2 className="text-base font-semibold text-ink">
              Convert a web page
            </h2>
            <p className="mt-1 text-sm text-muted">
              We fetch the page with a real browser and print it to A4.
            </p>

            <form onSubmit={handleConvert} className="mt-5 space-y-3">
              <label className="label" htmlFor="url">
                Page URL
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex flex-1 items-center gap-3 rounded-xl border border-cream-300 bg-cream-50 px-4">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 shrink-0 text-muted/60"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  >
                    <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
                    <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
                  </svg>
                  <input
                    id="url"
                    type="text"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="https://example.com/article"
                    className="w-full bg-transparent py-3 text-sm text-ink placeholder-muted/60 outline-none"
                    disabled={converting || limitReached}
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary shrink-0"
                  disabled={converting || limitReached}
                >
                  {converting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-cream-50/40 border-t-cream-50" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" />
                      </svg>
                      Download PDF
                    </>
                  )}
                </button>
              </div>
            </form>

            <label className="mt-3 flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-cream-300 bg-cream-50 px-4 py-3">
              <span>
                <span className="block text-sm font-medium text-ink">
                  Clean print mode
                </span>
                <span className="block text-xs text-muted/80">
                  Hide navbars, ads and sidebars from the PDF.
                </span>
              </span>
              <span className="relative inline-flex shrink-0">
                <input
                  type="checkbox"
                  checked={cleanMode}
                  onChange={(event) => setCleanMode(event.target.checked)}
                  className="peer sr-only"
                />
                <span className="h-6 w-11 rounded-full bg-cream-300 transition peer-checked:bg-brand-600" />
                <span className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
              </span>
            </label>

            {limitReached && (
              <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                You&apos;ve used all {FREE_LIMIT} free PDFs. Upgrade to Pro for
                unlimited conversions.
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {success}
              </div>
            )}

            <div className="mt-6 rounded-xl border border-cream-200 bg-cream-100 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-700/60">
                Tips
              </p>
              <ul className="mt-2 space-y-1.5 text-xs text-brand-900/70">
                <li>• Pages behind a login wall can&apos;t be captured.</li>
                <li>• Very long pages may take a few extra seconds.</li>
                <li>• Use the direct article URL for the cleanest output.</li>
              </ul>
            </div>
          </section>

          <section className="card">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink">
                Recent conversions
              </h2>
              <span className="text-xs text-muted/60">
                {history.length} shown
              </span>
            </div>

            {historyLoading ? (
              <div className="mt-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-14 animate-pulse rounded-xl bg-cream-200"
                  />
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-cream-300 px-6 py-10 text-center">
                <p className="text-sm text-muted">No PDFs yet.</p>
                <p className="mt-1 text-xs text-muted/70">
                  Your conversions will appear here.
                </p>
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-cream-200">
                {history.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 py-3.5"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-600/10 text-[9px] font-bold text-brand-700">
                      PDF
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-ink">
                        {item.url}
                      </p>
                      <p className="text-xs text-muted/70">
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setUrl(item.url);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="shrink-0 text-xs font-semibold text-brand-600 transition hover:text-brand-700"
                    >
                      Again
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card">
            <h2 className="text-base font-semibold text-ink">Usage</h2>
            <p className="mt-1 text-sm text-muted">
              {isFree
                ? `Free plan resets at ${FREE_LIMIT} PDFs per cycle.`
                : "You're on an unlimited plan."}
            </p>

            <div className="mt-5 flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-ink">{used}</p>
                <p className="text-xs text-muted/70">PDFs generated</p>
              </div>
              <p className="text-sm text-muted">
                {isFree ? `${remaining} left` : "Unlimited"}
              </p>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-cream-200">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  limitReached
                    ? "bg-gradient-to-r from-amber-400 to-rose-400"
                    : "bg-gradient-to-r from-brand-600 to-brand-400"
                }`}
                style={{ width: `${isFree ? percent : 100}%` }}
              />
            </div>

            {isFree && (
              <div className="mt-5 rounded-xl border border-brand-600/20 bg-brand-600/5 p-4">
                <p className="text-sm font-semibold text-ink">
                  Need more PDFs?
                </p>
                <p className="mt-1 text-xs text-brand-900/70">
                  Go Pro for unlimited conversions at $9/month.
                </p>
                <button
                  className="btn-primary mt-3 w-full !py-2.5"
                  onClick={() => setCheckoutOpen(true)}
                >
                  Upgrade to Pro
                </button>
              </div>
            )}
          </section>

          <section className="card">
            <h2 className="text-base font-semibold text-ink">Account</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted/70">Name</dt>
                <dd className="truncate text-ink">{user?.name}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted/70">Email</dt>
                <dd className="truncate text-ink">{user?.email}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted/70">Member since</dt>
                <dd className="text-ink">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "—"}
                </dd>
              </div>
            </dl>
            <button onClick={logout} className="btn-ghost mt-5 w-full !py-2.5">
              Log out
            </button>
          </section>
        </aside>
      </div>

      <MockCheckout
        open={checkoutOpen}
        plan={{ name: "Pro", price: "$9", period: "/month" }}
        email={user?.email}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={() => updateUser({ plan: "pro" })}
      />
    </div>
  );
}
