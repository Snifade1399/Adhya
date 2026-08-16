function AuthShell({ eyebrow, title, description, children, footer }) {

  return (
    <main className="min-h-[70vh] px-6 lg:px-10 py-16 lg:py-20">

      <div className="max-w-md mx-auto">

        {/* Header */}
        <div className="text-center">

          <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">
            {eyebrow}
          </p>

          <h1 className="mt-4 text-4xl lg:text-5xl font-semibold tracking-tight">
            {title}
          </h1>

          {description && (
            <p className="mt-4 text-[var(--muted)]">
              {description}
            </p>
          )}

        </div>


        {/* Card */}
        <div className="mt-10 border border-[var(--border)] rounded-2xl p-6 lg:p-8">
          {children}
        </div>


        {/* Footer */}
        {footer && (
          <div className="mt-8 text-center">
            {footer}
          </div>
        )}

      </div>

    </main>
  );
}

export default AuthShell;
