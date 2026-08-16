import { useState } from "react";
import { Link } from "react-router-dom";

import AuthShell from "../components/AuthShell";
import { supabase } from "../lib/supabaseClient";


function ForgotPassword() {

  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);


  async function handleSubmit(event) {

    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setError(null);

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setSubmitted(true);

  }


  /*
   * Post-submit "check your email" state.
   */
  if (submitted) {

    return (
      <AuthShell
        eyebrow="PASSWORD"
        title="Check your email."
        description={`We sent a password reset link to ${email}.`}
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
          The link expires shortly and can only be used once.
        </p>
      </AuthShell>
    );

  }


  return (
    <AuthShell
      eyebrow="PASSWORD"
      title="Forgot your password?"
      description="Enter your email and we'll send you a reset link."
      footer={
        <Link
          to="/login"
          className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
        >
          ← Back to sign in
        </Link>
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
          {submitting ? "Sending..." : "Send Reset Link"}
        </button>

      </form>
    </AuthShell>
  );
}

export default ForgotPassword;
