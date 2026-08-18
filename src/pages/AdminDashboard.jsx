import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { supabase } from "../lib/supabaseClient";


const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "products", label: "Products" },
  { key: "orders", label: "Orders" },
];


function AdminDashboard() {

  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    paidOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activePage = "dashboard";


  useEffect(() => {

    let active = true;

    async function loadDashboard() {
      setLoading(true);
      setError(null);

      const [productsResult, ordersResult] = await Promise.all([

        supabase
          .from("products")
          .select("*")
          .order("id"),

        supabase
          .from("orders")
          .select(
            "id, customer_name, total, payment_status, order_status, created_at"
          )
          .order("created_at", { ascending: false })
          .limit(10),

      ]);

      if (!active) {
        return;
      }

      if (productsResult.error) {
        console.error("Error fetching products:", productsResult.error);
        setError(productsResult.error.message);
        setLoading(false);
        return;
      }

      if (ordersResult.error) {
        console.error("Error fetching orders:", ordersResult.error);
      }

      const prods = productsResult.data || [];
      const orders = ordersResult.data || [];

      const paidOrders = orders.filter(
        (o) => o.payment_status === "paid"
      );
      const totalRevenue = paidOrders.reduce(
        (sum, o) => sum + (o.total || 0),
        0
      );

      setStats({
        totalProducts: prods.length,
        totalOrders: orders.length,
        paidOrders: paidOrders.length,
        totalRevenue,
      });
      setRecentOrders(orders);
      setProducts(prods);
      setLoading(false);
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);


  async function handleSignOut() {
    await signOut();
    navigate("/");
  }


  function formatCurrency(amount) {
    return `\u20B9${amount.toLocaleString("en-IN")}`;
  }


  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }


  function SidebarContent() {
    return (
      <>
        {/* Branding */}
        <div className="px-5 py-6 border-b border-[var(--border)]">
          <Link
            to="/"
            className="text-lg font-semibold tracking-[0.08em]"
          >
            ĀDHYA
          </Link>
          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
            Admin
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => setMobileMenuOpen(false)}
              className={`block w-full text-left px-4 py-2.5 text-sm rounded-lg transition-colors ${
                activePage === item.key
                  ? "text-[var(--text)] font-medium bg-[var(--text)]/5"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* User + sign out */}
        <div className="px-5 py-5 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--muted)] truncate">
            {user.email}
          </p>
          <button
            onClick={handleSignOut}
            className="mt-3 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            Sign out
          </button>
        </div>
      </>
    );
  }


  function renderContent() {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-sm text-[var(--muted)]">
            Loading dashboard...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--muted)]">
              Dashboard unavailable
            </p>
            <h2 className="mt-4 text-2xl font-semibold">
              Something went wrong.
            </h2>
            <p className="mt-3 text-sm text-[var(--muted)]">
              {error}
            </p>
          </div>
        </div>
      );
    }

    return (
      <>
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Overview of your store
          </p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Products", value: String(stats.totalProducts) },
            { label: "Total Orders", value: String(stats.totalOrders) },
            { label: "Paid Orders", value: String(stats.paidOrders) },
            { label: "Revenue", value: formatCurrency(stats.totalRevenue) },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5"
            >
              <p className="text-[11px] uppercase tracking-[0.15em] text-[var(--muted)]">
                {card.label}
              </p>
              <p className="mt-2.5 text-2xl font-semibold tracking-tight">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <section className="mt-10">
          <h2 className="text-base font-semibold tracking-tight">
            Recent Orders
          </h2>

          {recentOrders.length === 0 ? (
            <div className="mt-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 text-center">
              <p className="text-sm text-[var(--muted)]">
                No orders yet.
              </p>
            </div>
          ) : (
            <div className="mt-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] font-medium">
                        Customer
                      </th>
                      <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] font-medium">
                        Amount
                      </th>
                      <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] font-medium">
                        Payment
                      </th>
                      <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] font-medium">
                        Status
                      </th>
                      <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] font-medium">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-[var(--border)] last:border-b-0"
                      >
                        <td className="px-5 py-3.5">
                          {order.customer_name}
                        </td>
                        <td className="px-5 py-3.5 font-medium">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={order.payment_status} />
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={order.order_status} />
                        </td>
                        <td className="px-5 py-3.5 text-[var(--muted)]">
                          {formatDate(order.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-[var(--border)]">
                {recentOrders.map((order) => (
                  <div key={order.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {order.customer_name}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--muted)]">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        {formatCurrency(order.total)}
                      </p>
                    </div>
                    <div className="mt-2.5 flex gap-2">
                      <StatusBadge status={order.payment_status} />
                      <StatusBadge status={order.order_status} />
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </section>

        {/* Products */}
        <section className="mt-10">

          <h2 className="text-base font-semibold tracking-tight">
            Products
          </h2>

          {products.length === 0 ? (
            <div className="mt-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 text-center">
              <p className="text-sm text-[var(--muted)]">
                No products found.
              </p>
            </div>
          ) : (
            <div className="mt-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
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
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
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
                            <span className="font-medium">
                              {product.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-[var(--muted)]">
                          {product.category}
                        </td>
                        <td className="px-5 py-3.5 text-right font-medium">
                          {"\u20B9"}{product.price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-[var(--border)]">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="p-4 flex items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-[var(--background)] flex-shrink-0">
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
                    </div>
                    <p className="text-sm font-medium">
                      {"\u20B9"}{product.price}
                    </p>
                  </div>
                ))}
              </div>

            </div>
          )}

        </section>
      </>
    );
  }


  return (
    <div className="flex min-h-screen bg-[var(--background)]">

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-col flex-shrink-0 border-r border-[var(--border)] bg-[var(--surface)] sticky top-0 h-screen">
        <SidebarContent />
      </aside>


      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md">

        <div className="flex items-center justify-between px-4 py-4">

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1 text-[var(--text)]"
            aria-label="Open menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          <div className="text-center">
            <span className="text-sm font-semibold tracking-[0.08em]">
              ĀDHYA
            </span>
            <span className="ml-1.5 text-[10px] uppercase tracking-[0.15em] text-[var(--muted)]">
              Admin
            </span>
          </div>

          <div className="w-8" />

        </div>

      </header>


      {/* Mobile slide-out menu */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-transform duration-200 ease-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >

        <div
          className="absolute inset-0 bg-black/20"
          onClick={() => setMobileMenuOpen(false)}
        />

        <div className="relative w-72 h-full bg-[var(--surface)] border-r border-[var(--border)] flex flex-col">

          <div className="flex items-center justify-between px-5 py-5 border-b border-[var(--border)]">
            <div>
              <span className="text-lg font-semibold tracking-[0.08em]">
                ĀDHYA
              </span>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                Admin
              </p>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-xl leading-none text-[var(--muted)] hover:text-[var(--text)]"
              aria-label="Close menu"
            >
              ×
            </button>
          </div>

          <SidebarContent />

        </div>

      </div>


      {/* Main content */}
      <main className="flex-1 min-h-screen">
        <div className="lg:hidden h-16" />
        <div className="px-5 sm:px-8 lg:px-10 py-8 lg:py-12 max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>

    </div>
  );
}


function StatusBadge({ status }) {

  if (!status) {
    return null;
  }

  return (
    <span className="inline-block px-2 py-0.5 text-[11px] rounded-md border border-[var(--border)] text-[var(--muted)]">
      {status}
    </span>
  );
}


export default AdminDashboard;
