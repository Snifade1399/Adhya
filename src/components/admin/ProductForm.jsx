import { useEffect, useState } from "react";


const EMPTY_FORM = {
  name: "",
  price: "",
  category: "",
  description: "",
  image: "",
  slug: "",
};


function ProductForm({ open, product, onSubmit, onCancel }) {

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const isEdit = Boolean(product);


  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        price: product.price != null ? String(product.price) : "",
        category: product.category || "",
        description: product.description || "",
        image: product.image || "",
        slug: product.slug || "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [product, open]);


  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }


  function validate() {
    const next = {};

    if (!form.name.trim()) {
      next.name = "Required";
    }

    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) {
      next.price = "Enter a valid price";
    }

    if (!form.category.trim()) {
      next.category = "Required";
    }

    if (!form.image.trim()) {
      next.image = "Required";
    }

    if (!form.slug.trim()) {
      next.slug = "Required";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }


  async function handleSubmit(e) {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        name: form.name.trim(),
        price: Number(form.price),
        category: form.category.trim(),
        description: form.description.trim(),
        image: form.image.trim(),
        slug: form.slug.trim(),
      });
    } catch (err) {
      console.error("Product form error:", err);
    } finally {
      setSubmitting(false);
    }
  }


  if (!open) {
    return null;
  }


  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-4 pt-12 sm:pt-20">

      <div
        className="absolute inset-0 bg-black/30"
        onClick={onCancel}
      />

      <div className="relative w-full max-w-lg bg-[var(--surface)] border border-[var(--border)] rounded-xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
          <h2 className="text-base font-semibold tracking-tight">
            {isEdit ? "Edit Product" : "Add Product"}
          </h2>
          <button
            onClick={onCancel}
            className="text-xl leading-none text-[var(--muted)] hover:text-[var(--text)]"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Image preview */}
          {form.image && (
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-[var(--background)] border border-[var(--border)]">
              <img
                src={form.image}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] mb-1.5">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:border-[var(--text)]/30 transition-colors"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] mb-1.5">
              Price (₹)
            </label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              min="0"
              step="1"
              className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:border-[var(--text)]/30 transition-colors"
            />
            {errors.price && (
              <p className="mt-1 text-xs text-red-600">{errors.price}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] mb-1.5">
              Category
            </label>
            <input
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:border-[var(--text)]/30 transition-colors"
            />
            {errors.category && (
              <p className="mt-1 text-xs text-red-600">{errors.category}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] mb-1.5">
              Slug
            </label>
            <input
              type="text"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:border-[var(--text)]/30 transition-colors"
            />
            {errors.slug && (
              <p className="mt-1 text-xs text-red-600">{errors.slug}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:border-[var(--text)]/30 transition-colors resize-none"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] mb-1.5">
              Image URL
            </label>
            <input
              type="url"
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:border-[var(--text)]/30 transition-colors"
            />
            {errors.image && (
              <p className="mt-1 text-xs text-red-600">{errors.image}</p>
            )}
            <p className="mt-1 text-[11px] text-[var(--muted)]">
              Paste a direct image URL. Supabase Storage upload coming soon.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">

            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="px-4 py-2 text-sm rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm rounded-lg bg-[var(--text)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting
                ? "Saving..."
                : isEdit
                  ? "Save Changes"
                  : "Add Product"
              }
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


export default ProductForm;
