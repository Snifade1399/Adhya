import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import AuthShell from "../components/AuthShell";
import useAuth from "../hooks/useAuth";
import { supabase } from "../lib/supabaseClient";


function Login() {

  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  /*
   * Where to go after a successful sign-in:
   * the page the user originally wanted, if any.
   * Captured once on mount so it survives location changes
   * triggered by navigate() in handleSubmit.
   */
  const [from] = useState(location.state?.from?.pathname || "/");


  /*
   * Already signed in? Redirect immediately.
   */
  if (!loading && user) {
    return <Navigate to={from} replace />;
  }


  async function handleSubmit(event) {

    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setError(null);

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }

    /*
     * onAuthStateChange updates the context; navigate
     * to the intended page (or home).
     */
    navigate(from, { replace: true });

  }


  return (
    <AuthShell
      eyebrow="ACCOUNT"
      title="Welcome back."
      description="Sign in to your ĀDHYA account."
      footer={
        <>
          <Link
            to="/forgot-password"
            className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            Forgot your password?
          </Link>

          <div className="mt-6">

            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              New to ĀDHYA?
            </p>

            <Link
              to="/signup"
              className="mt-3 inline-block w-full px-6 py-4 rounded-full border border-[var(--text)] text-sm font-medium hover:bg-[var(--text)] hover:text-white transition-colors"
            >
              Create an account
            </Link>

          </div>
        </>
      }
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >

        <div>

          <label
            htmlFor="email"
            className="block text-sm font-medium mb-2"
          >
            Email address
          </label>

          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => {
              setError(null);
              setEmail(event.target.value);
            }}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-transparent outline-none focus:border-[var(--text)] transition-colors"
          />

        </div>


        <div>

          <label
            htmlFor="password"
            className="block text-sm font-medium mb-2"
          >
            Password
          </label>

          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => {
              setError(null);
              setPassword(event.target.value);
            }}
            placeholder="Your password"
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-transparent outline-none focus:border-[var(--text)] transition-colors"
          />

        </div>


        {error && (
          <p className="text-sm text-red-600 text-center">
            {error}
          </p>
        )}


        <button
          type="submit"
          disabled={submitting}
          className="w-full px-6 py-4 rounded-full bg-[var(--text)] text-white text-sm font-medium hover:bg-[var(--accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Signing in..." : "Sign In"}
        </button>

      </form>
    </AuthShell>
  );
}

export default Login;
