import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { getErrorMessage } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { user, signup } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const url = searchParams.get("url");
  const plan = searchParams.get("plan");

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  function update(field) {
    return (event) =>
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await signup(form);
      const query = url ? `?url=${encodeURIComponent(url)}` : "";
      navigate(`/dashboard${query}`);
    } catch (err) {
      setError(getErrorMessage(err, "Could not create your account."));
    } finally {
      setSubmitting(false);
    }
  }

  const loginQuery = new URLSearchParams();
  if (url) loginQuery.set("url", url);
  if (plan) loginQuery.set("plan", plan);
  const loginTo = loginQuery.toString()
    ? `/login?${loginQuery.toString()}`
    : "/login";

  return (
    <AuthLayout
      title="Create your account"
      subtitle={
        plan
          ? `You're signing up for the ${plan} plan. Start with 5 free PDFs.`
          : "Start with 5 free PDFs — no credit card required."
      }
      footer={
        <>
          Already have an account?{" "}
          <Link to={loginTo} className="font-semibold text-brand-600 hover:text-brand-700">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            value={form.name}
            onChange={update("name")}
            className="input"
            placeholder="Ada Lovelace"
          />
        </div>

        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={update("email")}
            className="input"
            placeholder="you@company.com"
          />
        </div>

        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={form.password}
            onChange={update("password")}
            className="input"
            placeholder="At least 6 characters"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? "Creating account…" : "Create free account"}
        </button>
      </form>
    </AuthLayout>
  );
}
