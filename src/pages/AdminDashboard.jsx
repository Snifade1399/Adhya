import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { supabase } from "../lib/supabaseClient";


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
  const [activeTab, setActiveTab] = useState("dashboard");


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


  if (loading) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center">
        <p className="text-sm text-[var(--muted)]">
          Loading dashboard...
        </p>
      </main>
    );
  }


  if (error) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-6">

        <div className="text-center">

          <p className="text-sm uppercase tracking-[0.25em] text-[var(--muted)]">
            Dashboard unavailable
          </p>

          <h1 className="mt-4 text-3xl font-semibold">
            Something went wrong.
          </h1>

          <p className="mt-4 text-sm text-[var(--muted)]">
            {error}
          </p>

        </div>

      </main>
    );
  }


  const statCards = [
    { label: "Total Products", value: String(stats.totalProducts) },
    { label: "Total Orders", value: String(stats.totalOrders) },
    { label: "Paid Orders", value: String(stats.paidOrders) },
    { label: "Revenue", value: formatCurrency(stats.totalRevenue) },
  ];


  return (
    <main className="min-h-[70vh]">

      {/* Admin header */}
      <div className="border-b border-[var(--border)] px-6 lg:px-10 py-6">

        <div className="max-w-6xl mx-auto flex items-center justify-between">

          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">
              Admin
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              ĀDHYA Dashboard
            </h1>
          </div>

          <button
            onClick={handleSignOut}
            className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            Sign out
          </button>

        </div>

      </div>


      {/* Navigation tabs */}
      <div className="border-b border-[var(--border)] px-6 lg:px-10">

        <div className="max-w-6xl mx-auto flex gap-8 overflow-x-auto">

          <button
            onClick={() => setActiveTab("dashboard")}
            className={`pb-3 text-sm whitespace-nowrap transition-colors ${
              activeTab === "dashboard"
                ? "text-[var(--text)] border-b border-[var(--text)]"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            Dashboard
          </button>

          <span className="pb-3 text-sm whitespace-nowrap text-[var(--muted)] opacity-40 cursor-not-allowed select-none">
            Products (coming soon)
          </span>

          <span className="pb-3 text-sm whitespace-nowrap text-[var(--muted)] opacity-40 cursor-not-allowed select-none">
            Orders (coming soon)
          </span>

        </div>

      </div>


      {/* Content */}
      <div className="px-6 lg:px-10 py-10 lg:py-14">

        <div className="max-w-6xl mx-auto">

          <p className="text-sm text-[var(--muted)] mb-10">
            Signed in as {user.email}
          </p>


          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">

            {statCards.map((card) => (
              <div
                key={card.label}
                className="border border-[var(--border)] rounded-2xl p-5 lg:p-6"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  {card.label}
                </p>
                <p className="mt-3 text-2xl lg:text-3xl font-semibold tracking-tight">
                  {card.value}
                </p>
              </div>
            ))}

          </div>


          {/* Recent Orders */}
          <section className="mt-12 lg:mt-16">

            <h2 className="text-lg font-semibold tracking-tight">
              Recent Orders
            </h2>

            {recentOrders.length === 0 ? (
              <div className="mt-6 border border-[var(--border)] rounded-2xl p-8 text-center">
                <p className="text-sm text-[var(--muted)]">
                  No orders yet.
                </p>
              </div>
            ) : (
              <div className="mt-6 border border-[var(--border)] rounded-2xl overflow-hidden">

                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.15em] text-[var(--muted)] font-medium">
                          Customer
                        </th>
                        <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.15em] text-[var(--muted)] font-medium">
                          Amount
                        </th>
                        <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.15em] text-[var(--muted)] font-medium">
                          Payment
                        </th>
                        <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.15em] text-[var(--muted)] font-medium">
                          Status
                        </th>
                        <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.15em] text-[var(--muted)] font-medium">
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
                          <td className="px-6 py-4">
                            {order.customer_name}
                          </td>
                          <td className="px-6 py-4">
                            {formatCurrency(order.total)}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={order.payment_status} />
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={order.order_status} />
                          </td>
                          <td className="px-6 py-4 text-[var(--muted)]">
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
                          <p className="mt-1 text-xs text-[var(--muted)]">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                        <p className="text-sm font-medium">
                          {formatCurrency(order.total)}
                        </p>
                      </div>

                      <div className="mt-3 flex gap-2">
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
          <section className="mt-12 lg:mt-16">

            <h2 className="text-lg font-semibold tracking-tight">
              Products
            </h2>

            {products.length === 0 ? (
              <div className="mt-6 border border-[var(--border)] rounded-2xl p-8 text-center">
                <p className="text-sm text-[var(--muted)]">
                  No products found.
                </p>
              </div>
            ) : (
              <div className="mt-6 border border-[var(--border)] rounded-2xl overflow-hidden">

                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.15em] text-[var(--muted)] font-medium">
                          Name
                        </th>
                        <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.15em] text-[var(--muted)] font-medium">
                          Category
                        </th>
                        <th className="text-right px-6 py-4 text-xs uppercase tracking-[0.15em] text-[var(--muted)] font-medium">
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
                          <td className="px-6 py-4 font-medium">
                            {product.name}
                          </td>
                          <td className="px-6 py-4 text-[var(--muted)]">
                            {product.category}
                          </td>
                          <td className="px-6 py-4 text-right">
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
                      className="p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {product.name}
                        </p>
                        <p className="mt-1 text-xs text-[var(--muted)]">
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

        </div>

      </div>

    </main>
  );
}


function StatusBadge({ status }) {

  if (!status) {
    return null;
  }

  return (
    <span className="inline-block px-2.5 py-0.5 text-xs rounded-full border border-[var(--border)] text-[var(--muted)]">
      {status}
    </span>
  );
}


export default AdminDashboard;
