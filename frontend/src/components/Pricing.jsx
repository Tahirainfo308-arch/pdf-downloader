import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MockCheckout from "./MockCheckout";
import PricingCard from "./PricingCard";
import { useAuth } from "../context/AuthContext";

const plans = [
  {
    id: "free",
    name: "Free",
    tagline: "Try PDFly, no card needed.",
    price: "$0",
    period: "/forever",
    cta: "Start free",
    ctaTo: "/signup",
    features: [
      "5 PDFs per cycle",
      "High-quality A4 output",
      "Conversion history",
      "Email & password account",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For people who save the web daily.",
    price: "$9",
    period: "/month",
    cta: "Go Pro",
    ctaTo: "/signup?plan=pro",
    featured: true,
    features: [
      "Unlimited PDF conversions",
      "Clean print mode",
      "Priority rendering queue",
      "Full-page backgrounds",
      "Conversion history",
      "Email support",
    ],
  },
  {
    id: "business",
    name: "Business",
    tagline: "For teams that ship documents.",
    price: "$29",
    period: "/month",
    cta: "Talk to us",
    ctaTo: "/signup?plan=business",
    features: [
      "Everything in Pro",
      "Shared team workspace",
      "Usage analytics",
      "API access",
      "Dedicated support",
    ],
  },
];

export default function Pricing() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [checkoutPlan, setCheckoutPlan] = useState(null);

  function handleSelect(plan) {
    if (!user) {
      navigate(`/signup?plan=${plan.id}`);
      return;
    }
    setCheckoutPlan(plan);
  }

  return (
    <section id="pricing" className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-72 -translate-y-1/2 bg-brand-600/10 blur-3xl" />
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-600">
            Pricing
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Simple plans that scale with you
          </h2>
          <p className="mt-4 text-muted">
            Start free, upgrade when your document pile grows. Cancel anytime.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              featured={plan.featured}
              onSelect={plan.id === "free" ? undefined : handleSelect}
            />
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted/70">
          Checkout is a demo interface — connect Stripe to accept live payments.
        </p>
      </div>

      <MockCheckout
        open={Boolean(checkoutPlan)}
        plan={checkoutPlan}
        email={user?.email}
        onClose={() => setCheckoutPlan(null)}
        onSuccess={(plan) => updateUser({ plan: plan.id })}
      />
    </section>
  );
}
