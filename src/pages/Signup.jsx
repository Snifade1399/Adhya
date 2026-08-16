import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import AuthShell from "../components/AuthShell";
import useAuth from "../hooks/useAuth";
import { supabase } from "../lib/supabaseClient";


function Signup() {

  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);


  if (!loading && user) {
    return <Navigate to="/" replace />;
  }


  async function handleSubmit(event) {

    event.preventDefault();

    if (submitting) {
      return;
    }

    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    const { data, error } =
      await supabase.auth.signUp(
        {
          email,
          password,
        },
        {
          redirectTo: `${window.location.origin}/account`,
        }
      );

    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }

    /*
     * With email confirmation enabled, signUp returns a user without a
     * session; the user must click the confirmation link first.
     */
    if (data?.session) {
      navigate("/account", { replace: true });
      return;
    }

    setSubmitting(false);
    setSubmitted(true);

  }


  /*
   * Post-signup "check your email" state.
   */
  if (submitted) {

    return (
      <AuthShell
        eyebrow="SIGN UP"
        title="Check your email."
        description={`We sent a confirmation link to ${email}.`}
        footer={
          <Link
            to="/login"
            className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            ← Back to sign in
          </Link>
        }
      >
        <p className="text-sm text-[var(--muted)] leading-relaxed text-center">
          Click the link in your email to verify your address.
          You'll be signed in automatically after confirming.
        </p>
      </AuthShell>
    );

  }


  return (
    <AuthShell
      eyebrow="SIGN UP"
      title="Create your account."
      description="Join ĀDHYA for a more personal experience."
      footer={
        <p className="text-sm text-[var(--muted)]">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-[var(--text)] hover:text-[var(--accent)] transition-colors"
          >
            Sign in
          </Link>
        </p>
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
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => {
              setError(null);
              setPassword(event.target.value);
            }}
            placeholder="At least 6 characters"
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-transparent outline-none focus:border-[var(--text)] transition-colors"
          />

        </div>


        <div>

          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium mb-2"
          >
            Confirm password
          </label>

          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(event) => {
              setError(null);
              setConfirmPassword(event.target.value);
            }}
            placeholder="Re-enter your password"
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
          {submitting ? "Creating Account..." : "Create Account"}
        </button>

      </form>
    </AuthShell>
  );
}

export default Signup;
