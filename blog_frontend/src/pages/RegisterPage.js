import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApi } from "../state/ApiContext";
import { useAuth } from "../state/AuthContext";
import { Button } from "../components/ui";

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

/**
 * PUBLIC_INTERFACE
 * Register page.
 */
export default function RegisterPage() {
  const api = useApi();
  const auth = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError({ message: "Name must be at least 2 characters." });
      return;
    }
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
      const res = await api.register({ name: name.trim(), email: email.trim(), password });
      const token = res?.token || res?.data?.token;
      const user = res?.user || res?.data?.user;
      auth.setSession({ token, user });
      navigate("/", { replace: true });
    } catch (e2) {
      setError(e2);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="page page--narrow">
      <h1 className="h1">Create account</h1>
      <p className="muted">Register to post comments and build your reading list.</p>

      <form className="form" onSubmit={submit}>
        <label className="label">
          Name
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
          />
        </label>

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
            placeholder="At least 6 characters"
            autoComplete="new-password"
          />
        </label>

        {error ? <div className="formError">{error.message || "Registration failed"}</div> : null}

        <div className="form__actions">
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Creating..." : "Create account"}
          </Button>
          <Link className="btn btn--ghost" to="/login">
            I already have an account
          </Link>
        </div>
      </form>
    </section>
  );
}
