import { useNavigate } from "react-router-dom";

import useAuth from "../hooks/useAuth";


function Account() {

  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();


  async function handleSignOut() {

    await signOut();

    navigate("/", { replace: true });

  }


  if (loading) {

    return (
      <main className="min-h-[70vh] flex items-center justify-center">
        <p className="text-sm text-[var(--muted)]">
          Loading account...
        </p>
      </main>
    );

  }


  const memberSince = new Date(user.created_at)
    .toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const emailVerified = Boolean(user.email_confirmed_at);


  return (
    <main className="px-6 lg:px-10 py-16 lg:py-20">

      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div>

          <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">
            ACCOUNT
          </p>

          <h1 className="mt-4 text-5xl lg:text-6xl font-semibold tracking-tight">
            Your account.
          </h1>

          <p className="mt-4 text-[var(--muted)]">
            {user.email}
          </p>

        </div>


        {/* Content */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Details */}
          <div className="border border-[var(--border)] rounded-2xl p-6 lg:p-8">

            <h2 className="text-2xl font-semibold tracking-tight">
              Details
            </h2>

            <div className="mt-6 space-y-5 text-sm">

              <div className="flex justify-between gap-4">

                <span className="text-[var(--muted)]">
                  Email
                </span>

                <span className="font-medium break-all text-right">
                  {user.email}
                </span>

              </div>


              <div className="flex justify-between gap-4">

                <span className="text-[var(--muted)]">
                  Email status
                </span>

                <span className="font-medium">
                  {emailVerified ? "Verified" : "Not verified"}
                </span>

              </div>


              <div className="flex justify-between gap-4">

                <span className="text-[var(--muted)]">
                  Member since
                </span>

                <span className="font-medium">
                  {memberSince}
                </span>

              </div>

            </div>


            {!emailVerified && (
              <p className="mt-6 text-xs text-[var(--muted)] leading-relaxed">
                Check your inbox and click the confirmation link
                to verify your email address.
              </p>
            )}


            <button
              onClick={handleSignOut}
              className="mt-8 px-7 py-4 rounded-full border border-[var(--border)] text-sm font-medium hover:bg-[var(--surface)] transition-colors"
            >
              Logout
            </button>

          </div>


          {/* Order history placeholder */}
          <div className="border border-[var(--border)] rounded-2xl p-6 lg:p-8">

            <h2 className="text-2xl font-semibold tracking-tight">
              Order history
            </h2>

            <p className="mt-6 text-sm text-[var(--muted)] leading-relaxed">
              Your past orders will appear here once order history
              is connected to your account.
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}

export default Account;
