function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onCancel }) {

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">

      <div
        className="absolute inset-0 bg-black/30"
        onClick={onCancel}
      />

      <div className="relative w-full max-w-sm bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">

        <h3 className="text-base font-semibold tracking-tight">
          {title}
        </h3>

        <p className="mt-2 text-sm text-[var(--muted)]">
          {message}
        </p>

        <div className="mt-6 flex justify-end gap-3">

          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
          >
            {confirmLabel || "Confirm"}
          </button>

        </div>

      </div>

    </div>
  );
}


export default ConfirmDialog;
