import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { getErrorMessage } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
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
    setSubmitting(true);
    try {
      await login(form);
      const query = url ? `?url=${encodeURIComponent(url)}` : "";
      navigate(`/dashboard${query}`);
    } catch (err) {
      setError(getErrorMessage(err, "Could not sign in."));
    } finally {
      setSubmitting(false);
    }
  }

  const signupQuery = new URLSearchParams();
  if (url) signupQuery.set("url", url);
  if (plan) signupQuery.set("plan", plan);
  const signupTo = signupQuery.toString()
    ? `/signup?${signupQuery.toString()}`
    : "/signup";

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to keep converting the web into PDFs."
      footer={
        <>
          New to PDFly?{" "}
          <Link to={signupTo} className="font-semibold text-brand-600 hover:text-brand-700">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
            autoComplete="current-password"
            required
            value={form.password}
            onChange={update("password")}
            className="input"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? "Signing in…" : "Log in"}
        </button>
      </form>
    </AuthLayout>
  );
}
