import { useEffect, useRef, useState } from "react";
import {
  validateImageFile,
  uploadProductImage,
  deleteProductImageIfStored,
} from "../../lib/storage";


const EMPTY_FORM = {
  name: "",
  price: "",
  category: "",
  description: "",
  image: "",
  slug: "",
};

const ACCEPTED_IMAGE_INPUT = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";


function ProductForm({ open, product, onSubmit, onCancel }) {

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);
  // Image value the product started with (null for new products). Used to
  // clean up a replaced Supabase Storage object after a successful save.
  const originalImageUrlRef = useRef(null);
  // Mirrors previewUrl so the unmount cleanup can always revoke the blob URL.
  const previewUrlRef = useRef(null);

  const isEdit = Boolean(product);

  // The image currently shown in the picker: staged local preview first,
  // otherwise the product's existing image value.
  const currentPreview = previewUrl || form.image || null;


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
      originalImageUrlRef.current = product.image || null;
    } else {
      setForm(EMPTY_FORM);
      originalImageUrlRef.current = null;
    }
    clearSelectedFile();
    setErrors({});
    setFormError(null);
  }, [product, open]);


  // Revoke any pending local preview URL when the modal unmounts.
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);


  function clearSelectedFile() {
    setFileError(null);
    setDragActive(false);
    setSelectedFile(null);
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreviewUrl(null);
  }


  function selectFile(file) {
    const validationError = validateImageFile(file);

    if (validationError) {
      setFileError(validationError);
      return;
    }

    setFileError(null);
    setFormError(null);
    setSelectedFile(file);

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setPreviewUrl(url);
  }


  function handleFileInputChange(e) {
    const file = e.target.files && e.target.files[0];

    // Reset the input so selecting the same file again still fires onChange.
    e.target.value = "";

    if (file) {
      selectFile(file);
    }
  }


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

    if (!form.image.trim() && !selectedFile) {
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
    setFormError(null);

    let uploadedUrl = null;

    try {
      // Upload the staged image first (if any), then persist its URL.
      let imageUrl = form.image.trim();

      if (selectedFile) {
        setUploading(true);
        imageUrl = await uploadProductImage(selectedFile, product?.id);
        uploadedUrl = imageUrl;
        setUploading(false);
      }

      await onSubmit({
        name: form.name.trim(),
        price: Number(form.price),
        category: form.category.trim(),
        description: form.description.trim(),
        image: imageUrl,
        slug: form.slug.trim(),
      });

      // Save succeeded. Best-effort cleanup of a replaced Storage image.
      // Local /images/* Vite assets are never touched (see storage.js).
      const original = originalImageUrlRef.current;
      if (
        uploadedUrl &&
        original &&
        original !== uploadedUrl
      ) {
        try {
          await deleteProductImageIfStored(original);
        } catch (cleanupErr) {
          console.error("Old product image cleanup failed:", cleanupErr);
        }
      }

      clearSelectedFile();
    } catch (err) {
      console.error("Product form error:", err);
      // If the upload landed but saving failed, avoid orphaned files.
      if (uploadedUrl) {
        try {
          await deleteProductImageIfStored(uploadedUrl);
        } catch (cleanupErr) {
          console.error("Uploaded image cleanup failed:", cleanupErr);
        }
      }
      setFormError(
        err?.message || "Something went wrong while saving the product.",
      );
    } finally {
      setUploading(false);
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

          {/* Image */}
          <div>
            <label className="block text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] mb-1.5">
              Image
            </label>

            <div
              role="button"
              tabIndex={0}
              aria-label="Product image upload. Drag and drop an image or press Enter to choose a file."
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragActive(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                const file = e.dataTransfer.files && e.dataTransfer.files[0];
                if (file) {
                  selectFile(file);
                }
              }}
              className={`flex flex-col items-center justify-center gap-3 w-full px-4 py-8 border border-dashed rounded-xl bg-[var(--background)] cursor-pointer transition-colors focus:outline-none focus:border-[var(--text)]/30 ${
                dragActive
                  ? "border-[var(--text)]/40 bg-[var(--text)]/5"
                  : "border-[var(--border)] hover:border-[var(--text)]/30"
              }`}
            >
              {currentPreview ? (
                <>
                  <div className="w-full h-36 rounded-lg overflow-hidden bg-[var(--surface)] flex items-center justify-center">
                    <img
                      src={currentPreview}
                      alt="Product preview"
                      className="max-h-36 max-w-full object-contain"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                  {selectedFile ? (
                    <p className="text-xs text-[var(--muted)] truncate max-w-full">
                      {selectedFile.name}
                    </p>
                  ) : (
                    <p className="text-xs text-[var(--muted)] truncate max-w-full">
                      Drop a new image here to replace
                    </p>
                  )}
                </>
              ) : (
                <>
                  <svg
                    className="w-8 h-8 text-[var(--muted)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M18 6h.008v.008H18V6zm2.25 12H3.75A1.5 1.5 0 012.25 16.5V6a1.5 1.5 0 011.5-1.5h16.5a1.5 1.5 0 011.5 1.5v10.5a1.5 1.5 0 01-1.5 1.5z"
                    />
                  </svg>
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      Drag &amp; drop an image here
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      or click to choose a file
                    </p>
                  </div>
                </>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_IMAGE_INPUT}
                onChange={handleFileInputChange}
                disabled={submitting}
                className="hidden"
              />
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between gap-2 mt-2">
                <p className="text-xs text-[var(--muted)] truncate">
                  {selectedFile.name}
                </p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearSelectedFile();
                    }}
                    disabled={submitting}
                    className="px-2.5 py-1 text-xs rounded-md border border-[var(--border)] text-[var(--muted)] hover:text-red-600 transition-colors disabled:opacity-50"
                  >
                    Remove
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    disabled={submitting}
                    className="px-2.5 py-1 text-xs rounded-md border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] transition-colors disabled:opacity-50"
                  >
                    Choose another
                  </button>
                </div>
              </div>
            )}

            <p className="mt-1.5 text-[11px] text-[var(--muted)]">
              JPG, PNG or WebP · Max 5 MB
            </p>

            {errors.image && (
              <p className="mt-1 text-xs text-red-600">{errors.image}</p>
            )}
            {fileError && (
              <p className="mt-1 text-xs text-red-600">{fileError}</p>
            )}
          </div>

          {/* Actions */}
          {formError && (
            <p className="text-xs text-red-600">{formError}</p>
          )}

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
              {uploading
                ? "Uploading image..."
                : submitting
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
