import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useApi } from "../state/ApiContext";
import { useAuth } from "../state/AuthContext";
import { Button } from "../components/ui";

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

/**
 * PUBLIC_INTERFACE
 * Login page.
 */
export default function LoginPage() {
  const api = useApi();
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = useMemo(() => location.state?.from || "/", [location.state]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setError(null);

    if (!validateEmail(email)) {
      setError({ message: "Please enter a valid email address." });
      return;
    }
    if (password.trim().length < 6) {
      setError({ message: "Password must be at least 6 characters." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.login({ email: email.trim(), password });
      const token = res?.token || res?.data?.token;
      const user = res?.user || res?.data?.user;
      auth.setSession({ token, user });
      navigate(from, { replace: true });
    } catch (e2) {
      setError(e2);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="page page--narrow">
      <h1 className="h1">Login</h1>
      <p className="muted">Welcome back. Sign in to comment and personalize your experience.</p>

      <form className="form" onSubmit={submit}>
        <label className="label">
          Email
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>

        <label className="label">
          Password
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </label>

        {error ? <div className="formError">{error.message || "Login failed"}</div> : null}

        <div className="form__actions">
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </Button>
          <Link className="btn btn--ghost" to="/register">
            Create account
          </Link>
        </div>
      </form>
    </section>
  );
}
