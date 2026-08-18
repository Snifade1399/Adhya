import { useEffect, useState } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import ProductForm from "../components/admin/ProductForm";
import ConfirmDialog from "../components/admin/ConfirmDialog";
import {
  fetchAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../lib/products";


function AdminProducts() {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);


  useEffect(() => {
    loadProducts();
  }, []);


  async function loadProducts() {
    setLoading(true);
    setError(null);

    const { data, error: err } = await fetchAllProducts();

    if (err) {
      console.error("Error fetching products:", err);
      setError(err.message);
    } else {
      setProducts(data || []);
    }

    setLoading(false);
  }


  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))].sort();


  const filtered = products.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      !categoryFilter || p.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });


  function handleAdd() {
    setEditingProduct(null);
    setFormOpen(true);
  }


  function handleEdit(product) {
    setEditingProduct(product);
    setFormOpen(true);
  }


  async function handleFormSubmit(values) {
    if (editingProduct) {
      const { error: err } = await updateProduct(editingProduct.id, values);
      if (err) {
        throw err;
      }
    } else {
      const { error: err } = await createProduct(values);
      if (err) {
        throw err;
      }
    }

    setFormOpen(false);
    setEditingProduct(null);
    await loadProducts();
  }


  async function handleDeleteConfirm() {
    if (!deletingProduct) {
      return;
    }

    setDeleting(true);

    const { error: err } = await deleteProduct(deletingProduct.id);

    if (err) {
      console.error("Error deleting product:", err);
    }

    setDeleting(false);
    setDeletingProduct(null);
    await loadProducts();
  }


  function formatCurrency(amount) {
    return `\u20B9${amount.toLocaleString("en-IN")}`;
  }


  function renderContent() {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-sm text-[var(--muted)]">
            Loading products...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--muted)]">
              Products unavailable
            </p>
            <h2 className="mt-4 text-2xl font-semibold">
              Something went wrong.
            </h2>
            <p className="mt-3 text-sm text-[var(--muted)]">
              {error}
            </p>
            <button
              onClick={loadProducts}
              className="mt-4 text-sm text-[var(--accent)] hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Products
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {products.length} product{products.length !== 1 ? "s" : ""} in your catalogue
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg bg-[var(--text)] text-white hover:opacity-90 transition-opacity"
          >
            Add Product
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">

          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--surface)] focus:outline-none focus:border-[var(--text)]/30 transition-colors"
            />
          </div>

          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--surface)] focus:outline-none focus:border-[var(--text)]/30 transition-colors"
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}

        </div>

        {/* Product list */}
        {filtered.length === 0 ? (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 text-center">
            <p className="text-sm text-[var(--muted)]">
              {products.length === 0
                ? "No products yet. Add your first product to get started."
                : "No products match your search."
              }
            </p>
          </div>
        ) : (

          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] font-medium">
                      Product
                    </th>
                    <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] font-medium">
                      Category
                    </th>
                    <th className="text-right px-5 py-3.5 text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] font-medium">
                      Price
                    </th>
                    <th className="text-right px-5 py-3.5 text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-[var(--border)] last:border-b-0"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-[var(--background)] flex-shrink-0">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[var(--muted)] text-xs">
                                —
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">
                              {product.name}
                            </p>
                            <p className="text-xs text-[var(--muted)] truncate">
                              {product.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[var(--muted)]">
                        {product.category}
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="px-3 py-1.5 text-xs rounded-md border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeletingProduct(product)}
                            className="px-3 py-1.5 text-xs rounded-md border border-[var(--border)] text-[var(--muted)] hover:text-red-600 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {filtered.map((product) => (
                <div
                  key={product.id}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-[var(--background)] flex-shrink-0">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--muted)] text-xs">
                          —
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {product.name}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--muted)]">
                        {product.category}
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="px-3 py-1.5 text-xs rounded-md border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingProduct(product)}
                      className="px-3 py-1.5 text-xs rounded-md border border-[var(--border)] text-[var(--muted)] hover:text-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </>
        )}
      </>
    );
  }


  return (
    <AdminLayout>
      {renderContent()}

      <ProductForm
        open={formOpen}
        product={editingProduct}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setFormOpen(false);
          setEditingProduct(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(deletingProduct)}
        title="Delete product"
        message={
          deletingProduct
            ? `Are you sure you want to delete "${deletingProduct.name}"? This cannot be undone.`
            : ""
        }
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingProduct(null)}
      />
    </AdminLayout>
  );
}


export default AdminProducts;
