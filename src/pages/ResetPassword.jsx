import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AuthShell from "../components/AuthShell";
import { supabase } from "../lib/supabaseClient";


function ResetPassword() {

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);
  const [recoveryReady, setRecoveryReady] = useState(false);


  useEffect(() => {

    let active = true;

    /*
     * Confirm a valid recovery session exists before showing the form.
     */
    supabase.auth.getSession()
      .then(({ data, error }) => {

        if (!active) {
          return;
        }

        if (error) {
          console.error("Could not check recovery session:", error);
        }

        if (data?.session) {
          setRecoveryReady(true);
        }

        setChecking(false);

      });


    /*
     * The recovery link lands here with tokens in the URL; supabase-js
     * processes them and emits PASSWORD_RECOVERY with a session.
     */
    const { data: subscription } =
      supabase.auth.onAuthStateChange((event, session) => {

        if (!active) {
          return;
        }

        if (event === "PASSWORD_RECOVERY" && session) {
          setRecoveryReady(true);
          setChecking(false);
        }

      });


    return () => {

      active = false;
      subscription.subscription.unsubscribe();

    };

  }, []);


  async function handleSubmit(event) {

    event.preventDefault();

    if (submitting) {
      return;
    }

    setError(null);
    setMessage(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }

    setMessage("Your password has been updated.");
    setPassword("");
    setConfirmPassword("");
    setSubmitting(false);

  }


  /*
   * Loading
   */
  if (checking) {

    return (
      <main className="min-h-[70vh] flex items-center justify-center">
        <p className="text-sm text-[var(--muted)]">
          Checking reset link...
        </p>
      </main>
    );

  }


  /*
   * No valid recovery session.
   */
  if (!recoveryReady) {

    return (
      <AuthShell
        eyebrow="PASSWORD"
        title="Reset link invalid."
        description="This link is missing, expired, or has already been used."
        footer={
          <Link
            to="/forgot-password"
            className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            Request a new reset link
          </Link>
        }
      >
        <p className="text-sm text-[var(--muted)] leading-relaxed text-center">
          Use the link from your email to set a new password.
        </p>
      </AuthShell>
    );

  }


  return (
    <AuthShell
      eyebrow="PASSWORD"
      title="Set a new password."
      description="Choose a new password for your account."
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
            htmlFor="password"
            className="block text-sm font-medium mb-2"
          >
            New password
          </label>

          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => {
              setError(null);
              setMessage(null);
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
            Confirm new password
          </label>

          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(event) => {
              setError(null);
              setMessage(null);
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


        {message && (
          <p className="text-sm text-green-700 text-center">
            {message}
          </p>
        )}


        <button
          type="submit"
          disabled={submitting}
          className="w-full px-6 py-4 rounded-full bg-[var(--text)] text-white text-sm font-medium hover:bg-[var(--accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Updating..." : "Update Password"}
        </button>

      </form>
    </AuthShell>
  );
}

export default ResetPassword;
