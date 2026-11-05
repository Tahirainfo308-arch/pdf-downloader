import { useEffect, useState } from "react";

export default function MockCheckout({ open, plan, onClose, onSuccess, email = "" }) {
  const [stage, setStage] = useState("form");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [card, setCard] = useState({
    email: "",
    number: "4242 4242 4242 4242",
    expiry: "12 / 34",
    cvc: "123",
  });

  useEffect(() => {
    if (!open) return;
    setStage("form");
    setProcessing(false);
    setError("");
    setCard({
      email,
      number: "4242 4242 4242 4242",
      expiry: "12 / 34",
      cvc: "123",
    });
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open || !plan) return null;

  function update(field) {
    return (event) => setCard((prev) => ({ ...prev, [field]: event.target.value }));
  }

  function handleNumber(event) {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
    setCard((prev) => ({ ...prev, number: formatted }));
  }

  function handleExpiry(event) {
    let digits = event.target.value.replace(/\D/g, "").slice(0, 4);
    if (digits.length > 2) {
      digits = `${digits.slice(0, 2)} / ${digits.slice(2)}`;
    }
    setCard((prev) => ({ ...prev, expiry: digits }));
  }

  async function handlePay(event) {
    event.preventDefault();
    setError("");

    if (card.number.replace(/\s/g, "").length < 16) {
      setError("Enter a 16-digit demo card number (e.g. 4242 4242 4242 4242).");
      return;
    }
    if (!card.expiry || card.cvc.length < 3) {
      setError("Add a demo expiry date and CVC.");
      return;
    }

    setProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1300));
    setProcessing(false);
    setStage("success");
    onSuccess?.(plan);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-brand-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Demo checkout"
        className="relative w-full max-w-md rounded-2xl border border-cream-300 bg-cream-50 p-6 shadow-2xl shadow-brand-900/25"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-cream-200 hover:text-ink"
          aria-label="Close checkout"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        {stage === "success" ? (
          <div className="py-6 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-600/10 text-emerald-700">
              <svg
                viewBox="0 0 24 24"
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h2 className="mt-5 text-xl font-bold text-ink">
              Payment successful
            </h2>
            <p className="mt-2 text-sm text-muted">
              You&apos;re now on the <strong className="text-brand-700">{plan.name}</strong>{" "}
              plan. This is a demo checkout — no real card was charged.
            </p>
            <button onClick={onClose} className="btn-primary mt-6 w-full">
              Back to dashboard
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">Checkout</h2>
              <span className="rounded-full bg-brand-600/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-700">
                Test mode
              </span>
            </div>
            <p className="mt-1 text-xs text-muted/80">
              Stripe-style demo form. Use the pre-filled test card — nothing is
              charged or stored.
            </p>

            <div className="mt-5 flex items-center justify-between rounded-xl border border-cream-300 bg-white p-4">
              <div>
                <p className="text-sm font-semibold text-ink">
                  PDFly {plan.name}
                </p>
                <p className="text-xs text-muted">
                  Billed monthly, cancel anytime
                </p>
              </div>
              <p className="text-lg font-bold text-ink">
                {plan.price}
                <span className="text-xs font-normal text-muted">
                  {plan.period}
                </span>
              </p>
            </div>

            <form onSubmit={handlePay} className="mt-5 space-y-3">
              <div>
                <label className="label" htmlFor="checkout-email">
                  Email
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  required
                  value={card.email}
                  onChange={update("email")}
                  className="input"
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <label className="label" htmlFor="checkout-card">
                  Card number
                </label>
                <div className="relative">
                  <input
                    id="checkout-card"
                    inputMode="numeric"
                    value={card.number}
                    onChange={handleNumber}
                    className="input pr-12"
                    placeholder="4242 4242 4242 4242"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded bg-cream-200 px-1.5 py-0.5 text-[10px] font-bold text-brand-700">
                    VISA
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="checkout-expiry">
                    Expiry
                  </label>
                  <input
                    id="checkout-expiry"
                    inputMode="numeric"
                    value={card.expiry}
                    onChange={handleExpiry}
                    className="input"
                    placeholder="MM / YY"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="checkout-cvc">
                    CVC
                  </label>
                  <input
                    id="checkout-cvc"
                    inputMode="numeric"
                    value={card.cvc}
                    onChange={update("cvc")}
                    maxLength={4}
                    className="input"
                    placeholder="123"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs text-rose-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={processing}
                className="btn-primary w-full"
              >
                {processing ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-cream-50/40 border-t-cream-50" />
                    Processing…
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
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Pay {plan.price} (demo)
                  </>
                )}
              </button>
            </form>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] text-muted/70">
              <svg
                viewBox="0 0 24 24"
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Mock integration — connect Stripe for live payments.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
